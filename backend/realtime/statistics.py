import math


# =====================================================
# MEAN
# =====================================================

def mean(values):

    if not values:
        return 0.0

    return sum(values) / len(values)


# =====================================================
# VARIANCE
# =====================================================

def variance(values):

    if len(values) <= 1:
        return 0.0

    m = mean(values)

    return sum(
        (x - m) ** 2
        for x in values
    ) / len(values)


# =====================================================
# STANDARD DEVIATION
# =====================================================

def std(values):

    return math.sqrt(
        variance(values)
    )


# =====================================================
# MINIMUM
# =====================================================

def minimum(values):

    if not values:
        return 0.0

    return min(values)


# =====================================================
# MAXIMUM
# =====================================================

def maximum(values):

    if not values:
        return 0.0

    return max(values)


# =====================================================
# TOTAL
# =====================================================

def total(values):

    return float(
        sum(values)
    )


# =====================================================
# RATE
# =====================================================

def rate(total_value, duration):

    if duration <= 0:
        return 0.0

    return total_value / duration


# =====================================================
# PACKET LENGTHS
# =====================================================

def packet_lengths(packet_list):

    return [
        len(packet)
        for packet in packet_list
    ]


# =====================================================
# DURATION
# =====================================================

def duration(start_time, end_time):

    return max(
        end_time - start_time,
        0.0
    )


# =====================================================
# SAFE DIVISION
# =====================================================

def safe_divide(a, b):

    if b == 0:
        return 0.0

    return a / b


# =====================================================
# IP HEADER LENGTH
# =====================================================

def header_length(packet):

    if not packet.haslayer("IP"):
        return 0

    ihl = packet["IP"].ihl

    # Scapy may leave IHL as None
    # when the packet has not been serialized.
    if ihl is None:
        return 20

    return ihl * 4


# =====================================================
# TCP WINDOW SIZE
# =====================================================

def tcp_window(packet):

    if packet.haslayer("TCP"):
        return packet["TCP"].window

    return 0


# =====================================================
# IP PROTOCOL
# =====================================================

def protocol(packet):

    if packet.haslayer("IP"):
        return packet["IP"].proto

    return 0


# =====================================================
# DESTINATION PORT
# =====================================================

def destination_port(packet):

    if packet.haslayer("TCP"):
        return packet["TCP"].dport

    if packet.haslayer("UDP"):
        return packet["UDP"].dport

    return 0