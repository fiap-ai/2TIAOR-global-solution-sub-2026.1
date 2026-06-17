# TerraVista — Minimal I2C LCD1602 driver (MicroPython)
#
# Drives a 16x2 HD44780 LCD through a PCF8574 I2C backpack (default addr 0x27),
# which is what Wokwi's `wokwi-lcd1602` in I2C mode emulates. Kept tiny on
# purpose — just init, clear and write_line.
#
# Author: Gabriel Mule (RM 560586)

import time

# PCF8574 bit layout on the LCD backpack.
_BACKLIGHT = 0x08
_ENABLE = 0x04
_RS = 0x01  # 0 = command, 1 = data


class Lcd1602:
    def __init__(self, i2c, addr=0x27):
        self.i2c = i2c
        self.addr = addr
        self._init_display()

    def _write_byte(self, data):
        self.i2c.writeto(self.addr, bytes([data | _BACKLIGHT]))

    def _pulse(self, data):
        self._write_byte(data | _ENABLE)
        time.sleep_us(1)
        self._write_byte(data & ~_ENABLE)
        time.sleep_us(50)

    def _send(self, value, mode):
        high = (value & 0xF0) | mode
        low = ((value << 4) & 0xF0) | mode
        self._pulse(high)
        self._pulse(low)

    def _command(self, cmd):
        self._send(cmd, 0)

    def _init_display(self):
        time.sleep_ms(50)
        # 4-bit init sequence.
        for _ in range(3):
            self._pulse(0x30)
            time.sleep_ms(5)
        self._pulse(0x20)  # set 4-bit mode
        self._command(0x28)  # 2 lines, 5x8 font
        self._command(0x0C)  # display on, cursor off
        self._command(0x06)  # entry mode: increment
        self.clear()

    def clear(self):
        self._command(0x01)
        time.sleep_ms(2)

    def write_line(self, text, line=0):
        """Write a 16-char line (0=top, 1=bottom), padded/truncated to width."""
        self._command(0x80 if line == 0 else 0xC0)
        for char in "{:<16}".format(text)[:16]:
            self._send(ord(char), _RS)
