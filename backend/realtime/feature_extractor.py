from backend.realtime.statistics import (
    mean,
    std,
    variance,
    minimum,
    maximum,
    total,
    rate,
    packet_lengths,
    safe_divide,
    destination_port,
    protocol,
    header_length,
    tcp_window,
)


# =====================================================
# FEATURE EXTRACTOR
# =====================================================

class FeatureExtractor:

    def __init__(self, flow):
        self.flow = flow

    # =================================================
    # FLOW DURATION
    # =================================================

    def duration(self):

        return max(
            self.flow.last_seen - self.flow.start_time,
            0.0
        )

    # =================================================
    # FORWARD PACKET LENGTHS
    # =================================================

    def fwd_lengths(self):

        return packet_lengths(
            self.flow.forward_packets
        )

    # =================================================
    # BACKWARD PACKET LENGTHS
    # =================================================

    def bwd_lengths(self):

        return packet_lengths(
            self.flow.backward_packets
        )

    # =================================================
    # ALL PACKET LENGTHS
    # =================================================

    def all_lengths(self):

        return (
            self.fwd_lengths()
            + self.bwd_lengths()
        )

    # =================================================
    # FORWARD PACKET COUNT
    # =================================================

    def total_forward_packets(self):

        return len(
            self.flow.forward_packets
        )

    # =================================================
    # BACKWARD PACKET COUNT
    # =================================================

    def total_backward_packets(self):

        return len(
            self.flow.backward_packets
        )

    # =================================================
    # FORWARD BYTES
    # =================================================

    def total_forward_bytes(self):

        return self.flow.forward_bytes

    # =================================================
    # BACKWARD BYTES
    # =================================================

    def total_backward_bytes(self):

        return self.flow.backward_bytes

    # =================================================
    # FLOW BYTES / SECOND
    # =================================================

    def flow_bytes_per_second(self):

        return rate(
            self.total_forward_bytes()
            + self.total_backward_bytes(),

            self.duration()
        )

    # =================================================
    # FLOW PACKETS / SECOND
    # =================================================

    def flow_packets_per_second(self):

        return rate(
            self.total_forward_packets()
            + self.total_backward_packets(),

            self.duration()
        )

    # =================================================
    # ACTIVE / IDLE FEATURES
    # =================================================

    def active_idle_features(self):

        active = list(
            self.flow.active_periods
        )

        idle = list(
            self.flow.idle_periods
        )

        # ---------------------------------------------
        # Finalize current active period
        # ---------------------------------------------

        if self.flow.last_packet_time is not None:

            current_active = (
                self.flow.last_packet_time
                - self.flow.active_start
            )

            if current_active > 0:

                active.append(
                    current_active
                )

        # ---------------------------------------------
        # 71-78
        # ---------------------------------------------

        return [

            # 71 Active Mean
            mean(active),

            # 72 Active Std
            std(active),

            # 73 Active Max
            maximum(active),

            # 74 Active Min
            minimum(active),

            # 75 Idle Mean
            mean(idle),

            # 76 Idle Std
            std(idle),

            # 77 Idle Max
            maximum(idle),

            # 78 Idle Min
            minimum(idle),
        ]

    # =================================================
    # BASIC FEATURES
    # =================================================

    def basic_features(self):

        # ---------------------------------------------
        # Find first packet
        # ---------------------------------------------

        first = None

        if self.flow.forward_packets:

            first = self.flow.forward_packets[0]

        elif self.flow.backward_packets:

            first = self.flow.backward_packets[0]

        # ---------------------------------------------
        # Empty flow
        # ---------------------------------------------

        if first is None:

            return [0.0] * 78

        # ---------------------------------------------
        # Packet lengths
        # ---------------------------------------------

        fwd = self.fwd_lengths()
        bwd = self.bwd_lengths()
        all_pkt = self.all_lengths()

        features = []

        # =================================================
        # 1-7 BASIC FLOW INFORMATION
        # =================================================

        # 1 Dst Port
        features.append(
            destination_port(first)
        )

        # 2 Protocol
        features.append(
            protocol(first)
        )

        # 3 Flow Duration
        features.append(
            self.duration()
        )

        # 4 Tot Fwd Pkts
        features.append(
            self.total_forward_packets()
        )

        # 5 Tot Bwd Pkts
        features.append(
            self.total_backward_packets()
        )

        # 6 TotLen Fwd Pkts
        features.append(
            self.total_forward_bytes()
        )

        # 7 TotLen Bwd Pkts
        features.append(
            self.total_backward_bytes()
        )

        # =================================================
        # 8-11 FORWARD PACKET LENGTH
        # =================================================

        # 8 Fwd Pkt Len Max
        features.append(
            maximum(fwd)
        )

        # 9 Fwd Pkt Len Min
        features.append(
            minimum(fwd)
        )

        # 10 Fwd Pkt Len Mean
        features.append(
            mean(fwd)
        )

        # 11 Fwd Pkt Len Std
        features.append(
            std(fwd)
        )

        # =================================================
        # 12-15 BACKWARD PACKET LENGTH
        # =================================================

        # 12 Bwd Pkt Len Max
        features.append(
            maximum(bwd)
        )

        # 13 Bwd Pkt Len Min
        features.append(
            minimum(bwd)
        )

        # 14 Bwd Pkt Len Mean
        features.append(
            mean(bwd)
        )

        # 15 Bwd Pkt Len Std
        features.append(
            std(bwd)
        )

        # =================================================
        # 16-17 FLOW RATES
        # =================================================

        # 16 Flow Byts/s
        features.append(
            self.flow_bytes_per_second()
        )

        # 17 Flow Pkts/s
        features.append(
            self.flow_packets_per_second()
        )

        # =================================================
        # 18-44 TIMING FEATURES
        # =================================================

        features.extend(
            self.timing_features()
        )

        # =================================================
        # 45-78 ADVANCED FEATURES
        # =================================================

        features.extend(
            self.advanced_features()
        )

        # =================================================
        # FINAL VALIDATION
        # =================================================

        assert len(features) == 78, (
            f"Expected 78 features, "
            f"generated {len(features)}"
        )

        return features

    # =====================================================
    # ADVANCED FEATURES
    # =====================================================

    def advanced_features(self):

        total_pkts = (
            self.total_forward_packets()
            + self.total_backward_packets()
        )

        total_bytes = (
            self.total_forward_bytes()
            + self.total_backward_bytes()
        )

        flags = self.flow.flags

        # ---------------------------------------------
        # First forward packet
        # ---------------------------------------------

        first_fwd = None

        if self.flow.forward_packets:

            first_fwd = (
                self.flow.forward_packets[0]
            )

        # ---------------------------------------------
        # First backward packet
        # ---------------------------------------------

        first_bwd = None

        if self.flow.backward_packets:

            first_bwd = (
                self.flow.backward_packets[0]
            )

        # ---------------------------------------------
        # Initial TCP window
        # ---------------------------------------------

        init_fwd_win = (
            tcp_window(first_fwd)
            if first_fwd
            else 0
        )

        init_bwd_win = (
            tcp_window(first_bwd)
            if first_bwd
            else 0
        )

        # ---------------------------------------------
        # Segment averages
        # ---------------------------------------------

        fwd_seg_avg = safe_divide(
            self.total_forward_bytes(),
            max(
                self.total_forward_packets(),
                1
            )
        )

        bwd_seg_avg = safe_divide(
            self.total_backward_bytes(),
            max(
                self.total_backward_packets(),
                1
            )
        )

        # ---------------------------------------------
        # Down / Up Ratio
        # ---------------------------------------------

        down_up_ratio = safe_divide(
            self.total_backward_packets(),
            max(
                self.total_forward_packets(),
                1
            )
        )

        # ---------------------------------------------
        # Packet Size Average
        # ---------------------------------------------

        pkt_size_avg = safe_divide(
            total_bytes,
            max(total_pkts, 1)
        )

        features = []

        # =================================================
        # 45-52 TCP FLAG COUNTS
        # =================================================

        # 45 FIN Flag Cnt
        features.append(
            flags["FIN"]
        )

        # 46 SYN Flag Cnt
        features.append(
            flags["SYN"]
        )

        # 47 RST Flag Cnt
        features.append(
            flags["RST"]
        )

        # 48 PSH Flag Cnt
        features.append(
            flags["PSH"]
        )

        # 49 ACK Flag Cnt
        features.append(
            flags["ACK"]
        )

        # 50 URG Flag Cnt
        features.append(
            flags["URG"]
        )

        # 51 CWE Flag Count
        features.append(
            flags["CWE"]
        )

        # 52 ECE Flag Cnt
        features.append(
            flags["ECE"]
        )

        # =================================================
        # 53 DOWN / UP RATIO
        # =================================================

        features.append(
            down_up_ratio
        )

        # =================================================
        # 54-56 PACKET / SEGMENT AVERAGES
        # =================================================

        # 54 Pkt Size Avg
        features.append(
            pkt_size_avg
        )

        # 55 Fwd Seg Size Avg
        features.append(
            fwd_seg_avg
        )

        # 56 Bwd Seg Size Avg
        features.append(
            bwd_seg_avg
        )

        # =================================================
        # 57-62 BLOCK FEATURES
        # =================================================
        #
        # These cannot currently be reproduced exactly
        # because Flow does not track CICFlowMeter-style
        # blocks.
        #
        # They remain zero rather than inventing values.
        #

        # 57 Fwd Byts/b Avg
        features.append(0.0)

        # 58 Fwd Pkts/b Avg
        features.append(0.0)

        # 59 Fwd Blk Rate Avg
        features.append(0.0)

        # 60 Bwd Byts/b Avg
        features.append(0.0)

        # 61 Bwd Pkts/b Avg
        features.append(0.0)

        # 62 Bwd Blk Rate Avg
        features.append(0.0)

        # =================================================
        # 63-66 SUBFLOW FEATURES
        # =================================================

        # 63 Subflow Fwd Pkts
        features.append(
            self.total_forward_packets()
        )

        # 64 Subflow Fwd Byts
        features.append(
            self.total_forward_bytes()
        )

        # 65 Subflow Bwd Pkts
        features.append(
            self.total_backward_packets()
        )

        # 66 Subflow Bwd Byts
        features.append(
            self.total_backward_bytes()
        )

        # =================================================
        # 67-68 INITIAL WINDOW SIZE
        # =================================================

        # 67 Init Fwd Win Byts
        features.append(
            init_fwd_win
        )

        # 68 Init Bwd Win Byts
        features.append(
            init_bwd_win
        )

        # =================================================
        # 69 FORWARD ACTIVE DATA PACKETS
        # =================================================
        #
        # Exact CICFlowMeter semantics require additional
        # packet-payload analysis. Current approximation
        # uses forward packet count.
        #

        features.append(
            self.total_forward_packets()
        )

        # =================================================
        # 70 FORWARD SEGMENT SIZE MIN
        # =================================================

        fwd_segment_sizes = [

            len(packet)

            for packet
            in self.flow.forward_packets
        ]

        features.append(
            minimum(fwd_segment_sizes)
        )

        # =================================================
        # 71-78 ACTIVE / IDLE
        # =================================================

        features.extend(
            self.active_idle_features()
        )

        return features

    # =====================================================
    # TIMING FEATURES
    # =====================================================

    def timing_features(self):

        fwd_iat = self.flow.fwd_iat
        bwd_iat = self.flow.bwd_iat
        flow_iat = self.flow.flow_iat

        # ---------------------------------------------
        # Header lengths
        # ---------------------------------------------

        fwd_headers = sum(
            header_length(packet)
            for packet
            in self.flow.forward_packets
        )

        bwd_headers = sum(
            header_length(packet)
            for packet
            in self.flow.backward_packets
        )

        duration = self.duration()

        all_pkt = self.all_lengths()

        features = []

        # =================================================
        # 18-21 FLOW IAT
        # =================================================

        # 18 Flow IAT Mean
        features.append(
            mean(flow_iat)
        )

        # 19 Flow IAT Std
        features.append(
            std(flow_iat)
        )

        # 20 Flow IAT Max
        features.append(
            maximum(flow_iat)
        )

        # 21 Flow IAT Min
        features.append(
            minimum(flow_iat)
        )

        # =================================================
        # 22-26 FORWARD IAT
        # =================================================

        # 22 Fwd IAT Tot
        features.append(
            total(fwd_iat)
        )

        # 23 Fwd IAT Mean
        features.append(
            mean(fwd_iat)
        )

        # 24 Fwd IAT Std
        features.append(
            std(fwd_iat)
        )

        # 25 Fwd IAT Max
        features.append(
            maximum(fwd_iat)
        )

        # 26 Fwd IAT Min
        features.append(
            minimum(fwd_iat)
        )

        # =================================================
        # 27-31 BACKWARD IAT
        # =================================================

        # 27 Bwd IAT Tot
        features.append(
            total(bwd_iat)
        )

        # 28 Bwd IAT Mean
        features.append(
            mean(bwd_iat)
        )

        # 29 Bwd IAT Std
        features.append(
            std(bwd_iat)
        )

        # 30 Bwd IAT Max
        features.append(
            maximum(bwd_iat)
        )

        # 31 Bwd IAT Min
        features.append(
            minimum(bwd_iat)
        )

        # =================================================
        # 32-35 DIRECTION-SPECIFIC TCP FLAGS
        # =================================================

        # 32 Fwd PSH Flags
        features.append(
            self.flow.fwd_flags["PSH"]
        )

        # 33 Bwd PSH Flags
        features.append(
            self.flow.bwd_flags["PSH"]
        )

        # 34 Fwd URG Flags
        features.append(
            self.flow.fwd_flags["URG"]
        )

        # 35 Bwd URG Flags
        features.append(
            self.flow.bwd_flags["URG"]
        )

        # =================================================
        # 36-37 HEADER LENGTH
        # =================================================

        # 36 Fwd Header Len
        features.append(
            fwd_headers
        )

        # 37 Bwd Header Len
        features.append(
            bwd_headers
        )

        # =================================================
        # 38-39 PACKET RATES
        # =================================================

        # 38 Fwd Pkts/s
        features.append(
            rate(
                self.total_forward_packets(),
                duration
            )
        )

        # 39 Bwd Pkts/s
        features.append(
            rate(
                self.total_backward_packets(),
                duration
            )
        )

        # =================================================
        # 40-44 PACKET LENGTH STATISTICS
        # =================================================

        # 40 Pkt Len Min
        features.append(
            minimum(all_pkt)
        )

        # 41 Pkt Len Max
        features.append(
            maximum(all_pkt)
        )

        # 42 Pkt Len Mean
        features.append(
            mean(all_pkt)
        )

        # 43 Pkt Len Std
        features.append(
            std(all_pkt)
        )

        # 44 Pkt Len Var
        features.append(
            variance(all_pkt)
        )

        # =================================================
        # VALIDATE TIMING FEATURE COUNT
        # =================================================

        assert len(features) == 27, (
            f"Timing features expected 27, "
            f"got {len(features)}"
        )

        return features