/**
 * MOTOR DRIVER L9110 - MKE-M17 I2C
 */
//% weight=100 color=#0D9488 icon="\uf1b9"
namespace motorDriverL9110 {

    let address = 0x40

    function sendCommand(mode: number, speed: number): void {
        // Gioi han toc do tu 0 den 100%
        speed = Math.max(0, Math.min(100, speed))

        // Quy doi 0-100% sang 0-255
        let pwm = Math.round(speed * 255 / 100)

        let buf = pins.createBuffer(6)

        buf[0] = 5
        buf[1] = mode
        buf[2] = 0
        buf[3] = 0
        buf[4] = 0
        buf[5] = pwm

        pins.i2cWriteBuffer(address, buf)
    }

    //% block="Khởi tạo MOTOR DRIVER L9110"
    export function begin(): void {
        // I2C address: 0x40
    }

    //% block="Motor A quay thuận tốc độ %speed"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% speed.help="Tốc độ động cơ từ 0 đến 100%"
    export function motorA_CW(speed: number): void {
        sendCommand(106, speed)
    }

    //% block="Motor A quay ngược tốc độ %speed"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% speed.help="Tốc độ động cơ từ 0 đến 100%"
    export function motorA_CCW(speed: number): void {
        sendCommand(107, speed)
    }

    //% block="Motor B quay thuận tốc độ %speed"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% speed.help="Tốc độ động cơ từ 0 đến 100%"
    export function motorB_CW(speed: number): void {
        sendCommand(108, speed)
    }

    //% block="Motor B quay ngược tốc độ %speed"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% speed.help="Tốc độ động cơ từ 0 đến 100%"
    export function motorB_CCW(speed: number): void {
        sendCommand(109, speed)
    }

    //% block="Dừng Motor A"
    export function stopA(): void {
        sendCommand(110, 0)
    }

    //% block="Dừng Motor B"
    export function stopB(): void {
        sendCommand(111, 0)
    }

    //% block="Dừng tất cả động cơ"
    export function stopAll(): void {
        stopA()
        stopB()
    }
}



/**
 * MAKE_STEAM - LCD1602
 */
//% weight=90 color=#D69E2E icon="\uf26c"
namespace LCD1602 {

    let lcdAddress = 0x27
    let backlight = 0x08
    let rs = 0

    function writeReg(value: number): void {
        pins.i2cWriteNumber(
            lcdAddress,
            value,
            NumberFormat.UInt8LE
        )
    }

    function sendNibble(value: number): void {
        value = (value & 0xF0) + backlight + rs

        writeReg(value)
        writeReg(value + 0x04)
        control.waitMicros(1)
        writeReg(value)
        control.waitMicros(50)
    }

    function command(value: number): void {
        rs = 0
        sendNibble(value)
        sendNibble(value << 4)
    }

    function sendData(value: number): void {
        rs = 1
        sendNibble(value)
        sendNibble(value << 4)
        rs = 0
    }

    //% block="Khởi tạo LCD1602"
    export function begin(): void {
        backlight = 0
        rs = 0

        basic.pause(50)
        writeReg(0x00)
        basic.pause(1000)

        sendNibble(0x30)
        control.waitMicros(4500)
        sendNibble(0x30)
        control.waitMicros(4500)
        sendNibble(0x30)
        control.waitMicros(150)
        sendNibble(0x20)

        command(0x28)
        command(0x0C)
        command(0x01)
        basic.pause(2)
        command(0x06)
        command(0x02)
        basic.pause(2)

        backlight = 0x08
    }

    //% block="LCD1602 hiển thị %text tại cột %column hàng %row"
    //% text.defl="MAKE STEAM"
    //% column.min=0 column.max=15
    //% row.min=0 row.max=1
    export function showText(
        text: string,
        column: number,
        row: number
    ): void {
        let rowAddress = [0x80, 0xC0]

        if (row < 0 || row > 1) return
        if (column < 0 || column > 15) return

        command(rowAddress[row] + column)

        let maxLength = 16 - column

        for (let i = 0; i < text.length && i < maxLength; i++) {
            sendData(text.charCodeAt(i))
        }
    }

    //% block="Xóa màn hình LCD1602"
    export function clear(): void {
        command(0x01)
        basic.pause(2)
    }

    //% block="Bật đèn nền LCD1602"
    export function backlightOn(): void {
        backlight = 0x08
        writeReg(backlight)
    }

    //% block="Tắt đèn nền LCD1602"
    export function backlightOff(): void {
        backlight = 0
        writeReg(0)
    }
}


/**
 * MAKE_STEAM - DHT11
 */

// Danh sach chan DHT11 duoc phep
enum DHT11Pin {
    //% block="P0"
    P0 = 0,
    //% block="P1"
    P1 = 1,
    //% block="P2"
    P2 = 2,
    //% block="P13"
    P13 = 13,
    //% block="P14"
    P14 = 14,
    //% block="P15"
    P15 = 15
}

//% weight=80 color=#21865B icon="\uf2c9"
namespace Cảm_Biến_DHT11 {

    let tempValue = 0
    let humiValue = 0

    function readSensor(pin: DHT11Pin): void {
        let data: number[] = [0, 0, 0, 0, 0]
        let buffer: boolean[] = []

        let sensorPin = pin as number
        let startTime = 0

        for (let i = 0; i < 40; i++) {
            buffer.push(false)
        }

        pins.digitalWritePin(sensorPin as DigitalPin, 0)
        basic.pause(18)

        pins.setPull(sensorPin as DigitalPin, PinPullMode.PullUp)
        pins.digitalReadPin(sensorPin as DigitalPin)
        control.waitMicros(40)

        startTime = control.micros()
        while (pins.digitalReadPin(sensorPin as DigitalPin) == 0) {
            if (control.micros() - startTime > 100) return
        }

        startTime = control.micros()
        while (pins.digitalReadPin(sensorPin as DigitalPin) == 1) {
            if (control.micros() - startTime > 100) return
        }

        for (let i = 0; i < 40; i++) {
            startTime = control.micros()

            while (pins.digitalReadPin(sensorPin as DigitalPin) == 1) {
                if (control.micros() - startTime > 100) return
            }

            startTime = control.micros()

            while (pins.digitalReadPin(sensorPin as DigitalPin) == 0) {
                if (control.micros() - startTime > 100) return
            }

            control.waitMicros(28)

            if (pins.digitalReadPin(sensorPin as DigitalPin) == 1) {
                buffer[i] = true
            }
        }

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 8; j++) {
                if (buffer[i * 8 + j]) {
                    data[i] += 2 ** (7 - j)
                }
            }
        }

        if (((data[0] + data[1] + data[2] + data[3]) & 0xFF) == data[4]) {
            humiValue = data[0]
            tempValue = data[2]
        }
    }

    //% block="Đọc nhiệt độ DHT11 chân %pin (°C)"
    //% pin.defl=DHT11Pin.P0
    export function temperature(pin: DHT11Pin): number {
        readSensor(pin)
        return tempValue
    }

    //% block="Đọc độ ẩm DHT11 chân %pin (%)"
    //% pin.defl=DHT11Pin.P0
    export function humidity(pin: DHT11Pin): number {
        readSensor(pin)
        return humiValue
    }
}



/**
 * MAKE_STEAM - DS18B20
 */

// Danh sach chan DS18B20 duoc phep
enum DS18B20Pin {
    //% block="P0"
    P0 = 0,
    //% block="P1"
    P1 = 1,
    //% block="P2"
    P2 = 2,
    //% block="P13"
    P13 = 13,
    //% block="P14"
    P14 = 14,
    //% block="P15"
    P15 = 15
}

//% weight=70 color=#8055A5 icon="\uf2c7"
namespace DS18B20 {

    let lastTemp = 0
    let busy = false

    function getPin(pin: DS18B20Pin): DigitalPin {
        switch (pin) {
            case DS18B20Pin.P0: return DigitalPin.P0
            case DS18B20Pin.P1: return DigitalPin.P1
            case DS18B20Pin.P2: return DigitalPin.P2
            case DS18B20Pin.P13: return DigitalPin.P13
            case DS18B20Pin.P14: return DigitalPin.P14
            case DS18B20Pin.P15: return DigitalPin.P15
        }
        return DigitalPin.P0
    }

    // Reset OneWire va kiem tra Presence
    function reset(pin: DigitalPin): boolean {
        pins.digitalWritePin(pin, 0)
        control.waitMicros(600)

        pins.digitalWritePin(pin, 1)
        control.waitMicros(30)

        let present = pins.digitalReadPin(pin) == 0

        control.waitMicros(600)

        return present
    }

    // Ghi 1 byte OneWire
    function writeByte(pin: DigitalPin, value: number): void {
        for (let i = 0; i < 8; i++) {
            pins.digitalWritePin(pin, 0)

            if (value & 1) {
                control.waitMicros(3)
                pins.digitalWritePin(pin, 1)
                control.waitMicros(60)
            } else {
                control.waitMicros(60)
                pins.digitalWritePin(pin, 1)
                control.waitMicros(3)
            }

            value = value >> 1
        }
    }

    // Doc 1 bit OneWire
    function readBit(pin: DigitalPin): number {
        pins.digitalWritePin(pin, 0)
        control.waitMicros(3)

        pins.digitalWritePin(pin, 1)
        control.waitMicros(5)

        let value = pins.digitalReadPin(pin)

        control.waitMicros(55)

        return value
    }

    // Doc 1 byte OneWire
    function readByte(pin: DigitalPin): number {
        let value = 0

        for (let i = 0; i < 8; i++) {
            if (readBit(pin)) {
                value |= (1 << i)
            }
        }

        return value
    }

    // CRC-8 Dallas/Maxim
    function crc8(data: number[]): number {
        let crc = 0

        for (let i = 0; i < data.length; i++) {
            let value = data[i]

            for (let j = 0; j < 8; j++) {
                let mix = (crc ^ value) & 1

                crc = crc >> 1

                if (mix) {
                    crc = crc ^ 0x8C
                }

                value = value >> 1
            }
        }

        return crc
    }

    //% block="Đọc nhiệt độ DS18B20 chân %pin (°C)"
    //% pin.defl=DS18B20Pin.P0
    export function temperature(pin: DS18B20Pin): number {

        // Khong cho phep hai lan doc chong len nhau
        if (busy) {
            return lastTemp
        }

        busy = true

        let sensorPin = getPin(pin)
        let result = lastTemp

        pins.setPull(sensorPin, PinPullMode.PullUp)
        pins.digitalWritePin(sensorPin, 1)

        // Bat dau chuyen doi nhiet do
        if (reset(sensorPin)) {

            writeByte(sensorPin, 0xCC)
            writeByte(sensorPin, 0x44)

            // Cho chuyen doi 12-bit
            basic.pause(750)

            // Doc Scratchpad
            if (reset(sensorPin)) {

                writeByte(sensorPin, 0xCC)
                writeByte(sensorPin, 0xBE)

                let data: number[] = []

                // Doc day du 9 byte
                for (let i = 0; i < 9; i++) {
                    data.push(readByte(sensorPin))
                }

                // Kiem tra CRC
                let calculatedCRC = crc8([
                    data[0], data[1], data[2], data[3],
                    data[4], data[5], data[6], data[7]
                ])

                if (calculatedCRC == data[8]) {

                    // Ghep du lieu nhiet do 16-bit
                    let raw = (data[1] << 8) | data[0]

                    if (raw & 0x8000) {
                        raw = raw - 65536
                    }

                    let temp = Math.round(raw / 16 * 10) / 10

                    if (temp >= -55 && temp <= 125) {
                        lastTemp = temp
                        result = temp
                    }
                }
            }
        }

        busy = false

        return result
    }
}
