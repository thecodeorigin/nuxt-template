export interface ISend_vnp_Params {
  vnp_Version: string // Alphanumeric[1,8] Bắt buộc Phiên bản api mà merchant kết nối. Phiên bản hiện tại là : 2.1.0
  vnp_Command: string // Alpha[1,16] Bắt buộc Mã API sử dụng, mã cho giao dịch thanh toán là: pay
  vnp_TmnCode: string // Alphanumeric[8] Bắt buộc Mã website của merchant trên hệ thống của VNPAY. Ví dụ: 2QXUI4J4
  vnp_Amount: string // Numeric[1,12] Bắt buộc Số tiền thanh toán. Số tiền không mang các ký tự phân tách thập phân, phần nghìn, ký tự tiền tệ. Để gửi số tiền thanh toán là 10,000 VND (mười nghìn VNĐ) thì merchant cần nhân thêm 100 lần (khử phần thập phân), sau đó gửi sang VNPAY là: 1000000
  vnp_BankCode?: string // Alphanumeric[3,20] Tùy chọn Mã phương thức thanh toán, mã loại ngân hàng hoặc ví điện tử thanh toán.
  // Nếu không gửi sang tham số này, chuyển hướng người dùng sang VNPAY chọn phương thức thanh toán.
  // Lưu ý:
  // Các mã loại hình thức thanh toán lựa chọn tại website-ứng dụng của merchant
  // vnp_BankCode=VNPAYQRThanh toán quét mã QR
  // vnp_BankCode=VNBANKThẻ ATM - Tài khoản ngân hàng nội địa
  // vnp_BankCode=INTCARDThẻ thanh toán quốc tế
  vnp_CreateDate: string // Numeric[14] Bắt buộc Là thời gian phát sinh giao dịch định dạng yyyyMMddHHmmss (Time zone GMT+7) Ví dụ: 20220101103111
  vnp_CurrCode: string // Alpha[3] Bắt buộc Đơn vị tiền tệ sử dụng thanh toán. Hiện tại chỉ hỗ trợ VND
  vnp_IpAddr: string // Alphanumeric[7,45] Bắt buộc Địa chỉ IP của khách hàng thực hiện giao dịch. Ví dụ: 13.160.92.202
  vnp_Locale: string // Alpha[2,5] Bắt buộc Ngôn ngữ giao diện hiển thị. Hiện tại hỗ trợ Tiếng Việt (vn), Tiếng Anh (en)
  vnp_OrderInfo: string // Alphanumeric[1,255] Bắt buộc Thông tin mô tả nội dung thanh toán quy định dữ liệu gửi sang VNPAY (Tiếng Việt không dấu và không bao gồm các ký tự đặc biệt)
  // Ví dụ: Nap tien cho thue bao 0123456789. So tien 100,000 VND
  vnp_OrderType: string // Alpha[1,100] Bắt buộc Mã danh mục hàng hóa. Mỗi hàng hóa sẽ thuộc một nhóm danh mục do VNPAY quy định. Xem thêm bảng Danh mục hàng hóa
  vnp_ReturnUrl: string // Alphanumeric[10,255] Bắt buộc URL thông báo kết quả giao dịch khi Khách hàng kết thúc thanh toán. Ví dụ: https://domain.vn/VnPayReturn
  vnp_ExpireDate?: string // Numeric[14] Bắt buộc Thời gian hết hạn thanh toán GMT+7, định dạng: yyyyMMddHHmmss
  vnp_TxnRef: string // Alphanumeric[1,100] Bắt buộc Mã tham chiếu của giao dịch tại hệ thống của merchant. Mã này là duy nhất dùng để phân biệt các đơn hàng gửi sang VNPAY. Không được trùng lặp trong ngày. Ví dụ: 23554
  vnp_SecureHash?: string // Alphanumeric[32,256] Bắt buộc
}

export interface IReceive_vnp_Params {
  vnp_TmnCode: string // Alphanumeric[8] Bắt buộc Mã website của merchant trên hệ thống của VNPAY. Ví dụ: 2QXUI4J4
  vnp_Amount: string // Numeric[1,12] Bắt buộc Số tiền thanh toán. VNPAY phản hồi số tiền nhân thêm 100 lần.
  vnp_BankCode: string // Alphanumeric[3,20] Bắt buộc Mã Ngân hàng thanh toán. Ví dụ: NCB
  vnp_BankTranNo: string // Alphanumeric[1,255] Tùy chọn Mã giao dịch tại Ngân hàng. Ví dụ: NCB20170829152730
  vnp_CardType: string // Alpha[2,20] Tùy chọn Loại tài khoản/thẻ khách hàng sử dụng:ATM,QRCODE
  vnp_PayDate: string // Numeric[14] Tùy chọn Thời gian thanh toán. Định dạng: yyyyMMddHHmmss
  vnp_OrderInfo: string // Alphanumeric[1,255] Bắt buộc Thông tin mô tả nội dung thanh toán (Tiếng Việt, không dấu). Ví dụ: **Nap tien cho thue bao 0123456789. So tien 100,000 VND**
  vnp_TransactionNo: string // Numeric[1,15] Bắt buộc Mã giao dịch ghi nhận tại hệ thống VNPAY. Ví dụ: 20170829153052
  vnp_ResponseCode: string // Numeric[2] Bắt buộc Mã phản hồi kết quả thanh toán. Quy định mã trả lời 00 ứng với kết quả Thành công cho tất cả các API. Tham khảo thêm tại bảng mã lỗi
  vnp_TransactionStatus: string // Numeric[2] Bắt buộc Mã phản hồi kết quả thanh toán. Tình trạng của giao dịch tại Cổng thanh toán VNPAY.
  // -00: Giao dịch thanh toán được thực hiện thành công tại VNPAY
  // -Khác 00: Giao dịch không thành công tại VNPAY Tham khảo thêm tại bảng mã lỗi
  vnp_TxnRef: string // Alphanumeric[1,100] Bắt buộc Giống mã gửi sang VNPAY khi gửi yêu cầu thanh toán. Ví dụ: 23554
  vnp_SecureHashType: string // Alphanumeric[3,10] Tùy chọn Loại mã băm sử dụng: SHA256, HmacSHA512
  vnp_SecureHash: string // Alphanumeric[32,256] Bắt buộc
}
