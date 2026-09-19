import time
from collections import defaultdict


# =====================================================
# FLOW
# =====================================================

class Flow:

    def __init__(self):

        # -------------------------------------------------
        # Time
        # -------------------------------------------------

        self.start_time = time.time()
        self.last_seen = self.start_time

        # -------------------------------------------------
        # Packets
        # -------------------------------------------------

        self.forward_packets = []
        self.backward_packets = []

        # -------------------------------------------------
        # Bytes
        # -------------------------------------------------

        self.forward_bytes = 0
        self.backward_bytes = 0

        # -------------------------------------------------
        # Inter Arrival Time
        # -------------------------------------------------

        self.flow_iat = []
        self.fwd_iat = []
        self.bwd_iat = []

        self.last_fwd_time = None
        self.last_bwd_time = None

        # -------------------------------------------------
        # TCP Flags
        # -------------------------------------------------

        # Total flags
        self.flags = defaultdict(int)

        # Forward flags
        self.fwd_flags = defaultdict(int)

        # Backward flags
        self.bwd_flags = defaultdict(int)

        # -------------------------------------------------
        # Active / Idle
        # -------------------------------------------------

        self.active_periods = []
        self.idle_periods = []

        self.last_packet_time = None
        self.active_start = self.start_time

        # Gap greater than this is considered idle
        self.ACTIVE_THRESHOLD = 1.0

    # =====================================================
    # ADD PACKET
    # =====================================================

    def add_packet(self, packet, direction):

        now = time.time()

        # -------------------------------------------------
        # Active / Idle Tracking
        # -------------------------------------------------

        if self.last_packet_time is not None:

            gap = now - self.last_packet_time

            if gap > self.ACTIVE_THRESHOLD:

                # End previous active period
                active_duration = (
                    self.last_packet_time
                    - self.active_start
                )

                if active_duration > 0:
                    self.active_periods.append(
                        active_duration
                    )

                # Record idle period
                self.idle_periods.append(gap)

                # Start new active period
                self.active_start = now

        self.last_packet_time = now

        # -------------------------------------------------
        # Forward Direction
        # -------------------------------------------------

        if direction == "forward":

            self.forward_packets.append(packet)

            self.forward_bytes += len(packet)

            if self.last_fwd_time is not None:

                self.fwd_iat.append(
                    now - self.last_fwd_time
                )

            self.last_fwd_time = now

        # -------------------------------------------------
        # Backward Direction
        # -------------------------------------------------

        else:

            self.backward_packets.append(packet)

            self.backward_bytes += len(packet)

            if self.last_bwd_time is not None:

                self.bwd_iat.append(
                    now - self.last_bwd_time
                )

            self.last_bwd_time = now

        # -------------------------------------------------
        # Flow IAT
        # -------------------------------------------------

        if self.last_seen is not None:

            self.flow_iat.append(
                now - self.last_seen
            )

        self.last_seen = now

        # -------------------------------------------------
        # TCP Flags
        # -------------------------------------------------

        if packet.haslayer("TCP"):

            tcp = packet["TCP"]

            flag_values = {

                "FIN": bool(tcp.flags.F),
                "SYN": bool(tcp.flags.S),
                "RST": bool(tcp.flags.R),
                "PSH": bool(tcp.flags.P),
                "ACK": bool(tcp.flags.A),
                "URG": bool(tcp.flags.U),
                "ECE": bool(tcp.flags.E),
                "CWE": bool(tcp.flags.C),

            }

            for name, present in flag_values.items():

                if present:

                    # Total flag count
                    self.flags[name] += 1

                    # Direction-specific flag count
                    if direction == "forward":

                        self.fwd_flags[name] += 1

                    else:

                        self.bwd_flags[name] += 1


# =====================================================
# FLOW MANAGER
# =====================================================

class FlowManager:

    def __init__(self):

        self.flows = {}

    # =================================================
    # FLOW KEY
    # =================================================

    def get_flow_key(self, packet):

        if not packet.haslayer("IP"):

            return None

        ip = packet["IP"]

        src = ip.src
        dst = ip.dst
        proto = ip.proto

        sport = 0
        dport = 0

        # -------------------------------------------------
        # TCP
        # -------------------------------------------------

        if packet.haslayer("TCP"):

            sport = packet["TCP"].sport
            dport = packet["TCP"].dport

        # -------------------------------------------------
        # UDP
        # -------------------------------------------------

        elif packet.haslayer("UDP"):

            sport = packet["UDP"].sport
            dport = packet["UDP"].dport

        return (
            src,
            sport,
            dst,
            dport,
            proto
        )

    # =================================================
    # UPDATE FLOW
    # =================================================

    def update_flow(self, packet):

        key = self.get_flow_key(packet)

        if key is None:

            return None

        # Reverse direction

        reverse = (
            key[2],
            key[3],
            key[0],
            key[1],
            key[4]
        )

        # -------------------------------------------------
        # Existing Forward Flow
        # -------------------------------------------------

        if key in self.flows:

            flow = self.flows[key]

            direction = "forward"

        # -------------------------------------------------
        # Existing Reverse Flow
        # -------------------------------------------------

        elif reverse in self.flows:

            flow = self.flows[reverse]

            direction = "backward"

        # -------------------------------------------------
        # New Flow
        # -------------------------------------------------

        else:

            flow = Flow()

            self.flows[key] = flow

            direction = "forward"

        # Add packet to flow

        flow.add_packet(
            packet,
            direction
        )

        return flow


# =====================================================
# GLOBAL FLOW MANAGER
# =====================================================

flow_manager = FlowManager()