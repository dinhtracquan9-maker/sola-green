# HANSEONG Journal — Quy trình đăng bài SEO tự động

Tự động: chọn chủ đề trong hàng đợi → AI viết bài chuẩn SEO → sinh file HTML trong `/blog/`
→ thêm card vào `/blog/index.html` → commit & push lên `main` → Vercel tự deploy.

## Thành phần
- `data/blog_queue.json` — hàng đợi chủ đề (`topics[]`) và lịch sử (`published[]`).
- `scripts/publish_blog.py` — sinh 1 bài từ chủ đề `pending` đầu tiên.
- `.github/workflows/publish-blog.yml` — chạy theo lịch **Thứ Hai 01:00 UTC hằng tuần** (≈ 08:00 giờ VN), hoặc bấm chạy tay (Run workflow).
- `blog/index.html` — phải còn 2 dấu mốc `<!-- AUTO_POSTS_START -->` và `<!-- AUTO_POSTS_END -->` (card mới chèn ngay sau START).

## CÒN THIẾU để chạy thật: thêm 3 GitHub Secrets
Vào GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**, thêm:

| Secret | Giá trị ví dụ | Ghi chú |
|---|---|---|
| `BLOG_API_URL` | `https://api.openai.com/v1/chat/completions` | Endpoint chuẩn OpenAI chat/completions |
| `BLOG_API_KEY` | `sk-...` | API key của bạn (OpenAI/OpenRouter/DeepSeek...) |
| `BLOG_MODEL` | `gpt-4o-mini` | Model rẻ, đủ tốt; hoặc `gpt-4o` |

> Script dùng định dạng **OpenAI-compatible**. Dùng OpenRouter/DeepSeek/Groq... chỉ cần đổi URL + key + tên model.
> Muốn dùng **Claude (Anthropic)**: API của Claude là `/v1/messages` (khác định dạng) — cần chỉnh script một chút, nhắn mình làm giúp.

## Kết nối Vercel (deploy tự động)
Đảm bảo project Vercel đã liên kết repo `dinhtracquan9-maker/sola-green`, **Production Branch = `main`**.
Mỗi lần Action push lên `main`, Vercel tự build & deploy. (Commit của bot có `[skip ci]` để không kích hoạt lại Action.)

## Thêm / sửa chủ đề
Mở `data/blog_queue.json`, thêm vào `topics[]`:
```json
{"keyword":"từ khóa SEO","title":"Tiêu đề bài","category":"Procurement","status":"pending"}
```
Mỗi lần chạy lấy 1 chủ đề `pending` cũ nhất → khi xong đổi thành `published`. Hết `pending` thì Action bỏ qua (không lỗi).

## Cách dùng
- **Chạy thử ngay (không chờ lịch):** GitHub → tab **Actions** → *Publish HANSEONG Journal article* → **Run workflow**.
- **Tự động:** giữ nguyên, mỗi sáng Thứ Hai bài mới tự lên.
- **Đổi lịch:** sửa dòng `cron` trong workflow (vd `0 1 * * 1,4` = Thứ Hai & Thứ Năm).

## An toàn nội dung (đã cài sẵn trong prompt + validate)
- Không bịa chứng nhận, đối tác, giá, tồn kho, phê duyệt, "nhà phân phối uỷ quyền".
- Bài < 650 từ hoặc chứa thẻ cấm (`script/img/a/iframe/form`) → tự loại, không đăng.
- Mỗi bài có disclaimer "educational content, not medical/legal advice".

## Khuyến nghị
Vì đây là site doanh nghiệp, nên **chạy tay 1–2 bài đầu để kiểm chất lượng** trước khi bật lịch tự động hoàn toàn.
Nếu muốn "AI viết nháp → bạn duyệt trong Cursor → mới đăng", mình có thể đổi workflow sang tạo Pull Request thay vì push thẳng.
