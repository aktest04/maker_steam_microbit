# Maker STEAM micro:bit

for PXT/microbit

Thư viện MakeCode micro:bit này cung cấp các khối lệnh để điều khiển **MOTOR DRIVER L9110 - MKE-M17 I2C**, màn hình **LCD1602**, cảm biến nhiệt độ/độ ẩm **DHT11** và cảm biến nhiệt độ **DS18B20**. Tên bốn nhóm khối lệnh, màu sắc, biểu tượng và thứ tự hiển thị được giữ theo mã nguồn ban đầu.

## Mục đích sử dụng

Thư viện hỗ trợ giáo viên và học sinh THCS thực hành STEM với micro:bit: điều khiển động cơ, hiển thị thông tin và đọc dữ liệu cảm biến. Có thể dùng các khối trong chương trình MakeCode dạng Khối, JavaScript hoặc Python (MakeCode chuyển đổi chương trình theo các khả năng được hỗ trợ).

## Thêm thư viện vào MakeCode

1. Mở [Microsoft MakeCode for micro:bit](https://makecode.microbit.org/).
2. Mở hoặc tạo một dự án, chọn **Extensions (Tiện ích mở rộng)**.
3. Tìm kiếm URL GitHub của thư viện `https://github.com/TEN_TAI_KHOAN/maker_steam_microbit` và chọn thư viện.
4. Các nhóm `motorDriverL9110`, `LCD1602`, `Cảm_Biến_DHT11` và `DS18B20` sẽ xuất hiện trong danh mục khối lệnh.

Thay `TEN_TAI_KHOAN` bằng tên tài khoản GitHub của chủ repository sau khi repository được tạo và đẩy mã nguồn lên GitHub.

## Các nhóm và khối lệnh

### MOTOR DRIVER L9110

| Khối lệnh | Chức năng |
|---|---|
| Khởi tạo MOTOR DRIVER L9110 | Khối khởi tạo; địa chỉ I2C trong mã là `0x40`. |
| Motor A quay thuận tốc độ | Chạy Motor A theo chiều thuận với tốc độ 0–100%. |
| Motor A quay ngược tốc độ | Chạy Motor A theo chiều ngược với tốc độ 0–100%. |
| Motor B quay thuận tốc độ | Chạy Motor B theo chiều thuận với tốc độ 0–100%. |
| Motor B quay ngược tốc độ | Chạy Motor B theo chiều ngược với tốc độ 0–100%. |
| Dừng Motor A | Gửi lệnh dừng Motor A. |
| Dừng Motor B | Gửi lệnh dừng Motor B. |
| Dừng tất cả động cơ | Gửi lần lượt lệnh dừng Motor A và Motor B. |

Giá trị tốc độ mặc định trên khối là 50%; mã giới hạn tốc độ trong khoảng 0–100% và chuyển thành giá trị PWM trước khi gửi lệnh I2C.

### LCD1602

| Khối lệnh | Chức năng |
|---|---|
| Khởi tạo LCD1602 | Khởi tạo màn hình; địa chỉ I2C trong mã là `0x27`. |
| LCD1602 hiển thị ... tại cột ... hàng ... | Hiển thị văn bản tại cột 0–15, hàng 0–1. |
| Xóa màn hình LCD1602 | Xóa nội dung đang hiển thị. |
| Bật đèn nền LCD1602 | Bật đèn nền. |
| Tắt đèn nền LCD1602 | Tắt đèn nền. |

Văn bản bắt đầu mặc định là `MAKE STEAM`. Từ vị trí đã chọn, mỗi lần hiển thị tối đa đến hết hàng 16 ký tự.

### Cảm Biến DHT11

| Khối lệnh | Chức năng |
|---|---|
| Đọc nhiệt độ DHT11 chân ... (°C) | Đọc nhiệt độ trên chân đã chọn. |
| Đọc độ ẩm DHT11 chân ... (%) | Đọc độ ẩm trên chân đã chọn. |

Danh sách chân trong khối gồm P0, P1, P2, P13, P14 và P15. Mã giữ nguyên quy trình đọc, kiểm tra tổng kiểm dữ liệu và các khoảng chờ của nguồn ban đầu.

### DS18B20

| Khối lệnh | Chức năng |
|---|---|
| Đọc nhiệt độ DS18B20 chân ... (°C) | Đọc nhiệt độ trên chân đã chọn. |

Danh sách chân gồm P0, P1, P2, P13, P14 và P15. Mã thực hiện giao tiếp OneWire, chờ 750 ms cho chuyển đổi, kiểm tra CRC-8 Dallas/Maxim, xử lý số âm và làm tròn đến một chữ số thập phân. Nếu thao tác đọc đang bận hoặc dữ liệu không hợp lệ, khối trả về giá trị nhiệt độ đã lưu gần nhất.

## Ví dụ sử dụng

Trong MakeCode, có thể ghép các khối theo thứ tự sau:

1. Trong khối **khi bắt đầu**, gọi **Khởi tạo LCD1602**.
2. Gọi khối **LCD1602 hiển thị ... tại cột ... hàng ...** với nội dung `Nhiet do:`.
3. Ở vị trí cột phù hợp, dùng khối **nối chuỗi** để ghép chữ `Nhiet do: ` với giá trị trả về từ **Đọc nhiệt độ DHT11 chân P0 (°C)**.
4. Để điều khiển động cơ, gọi **Khởi tạo MOTOR DRIVER L9110**, sau đó dùng **Motor A quay thuận tốc độ 50**; khi cần dừng, gọi **Dừng tất cả động cơ**.

Ví dụ này chỉ minh họa cách ghép khối. Hãy chọn đúng chân và phần cứng thực tế của bộ học tập.

## Kết nối phần cứng và lưu ý

- Mã nguồn xác định địa chỉ I2C `0x40` cho bộ điều khiển L9110 MKE-M17 và địa chỉ I2C mặc định `0x27` cho LCD1602. Mã nguồn không cung cấp sơ đồ đấu dây hoặc thông tin nguồn điện.
- Với DHT11 và DS18B20, chọn một chân trong danh sách P0, P1, P2, P13, P14, P15. Mã đặt chân ở chế độ kéo lên khi đọc; điều này không thay thế yêu cầu đấu nối theo tài liệu của cảm biến hoặc module.
- Tài liệu đi kèm không nêu sơ đồ chân, mức điện áp, cách cấp nguồn hay cách nối chung các thiết bị. Không suy đoán cách đấu nối; hãy làm theo hướng dẫn của đúng bo mạch/module và hỏi giáo viên trước khi cấp nguồn.
- Các lần đọc DHT11 và DS18B20 có thể chờ trong khi giao tiếp; riêng DS18B20 chờ 750 ms để chuyển đổi nhiệt độ.
- Các khối LCD giới hạn cột từ 0 đến 15 và hàng từ 0 đến 1. Hãy khởi tạo LCD trước khi sử dụng các khối hiển thị.

## Thông tin phiên bản

- Phiên bản thư viện: **0.0.1**
- Nền tảng: **Microsoft MakeCode for micro:bit**
- Mã nguồn được chuyển từ `custom.txt`; thuật toán cảm biến và metadata khối được giữ nguyên.
