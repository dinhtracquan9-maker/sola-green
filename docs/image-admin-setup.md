# Quan tri anh bai viet

Trang dang nhap: https://www.hanseongbeauty.com/admin/
Khong them nut quan tri vao cac trang cong khai. Dashboard va API doc/ghi deu
yeu cau phien dang nhap; mat khau va token khong bao gio gui ve trinh duyet.

## Kich hoat mot lan tren Vercel

1. GitHub Settings > Developer settings > Personal access tokens > Fine-grained
   tokens. Chon **Only select repositories**, chi `sola-green`. Cap quyen
   repository **Contents: Read and write**; Metadata read la quyen mac dinh.
   Khong cap quyen Workflows, Administration hay cac repository khac.
   Chon han su dung phu hop va gia han truoc khi token het han.
2. Vercel > project sola-green > Settings > Environment Variables, Production:
   - `IMAGE_ADMIN_GITHUB_TOKEN`: token tren, danh dau Sensitive.
   - `IMAGE_ADMIN_PASSWORD`: mat khau rieng, it nhat 12 ky tu,
     tao trong trinh quan ly mat khau. Khong dung mat khau GitHub/Google.
   - `IMAGE_ADMIN_SESSION_SECRET`: tuy chon. Neu khong co chuoi it nhat 32 ky
     tu, may chu tu dan xuat khoa ky bang HMAC-SHA256 tu token GitHub va mat
     khau, voi nhan rieng cho phien quan tri. Khong gui khoa ve trinh duyet.
     Doi token se huy phien hien tai khi dung khoa tu dong.
   - `IMAGE_ADMIN_ORIGIN`: `https://www.hanseongbeauty.com`.
3. Redeploy tren Vercel. Khong cung cap Production secrets cho Preview hay PR
   tu fork. Khong gui secrets vao chat, commit hay anh chup man hinh.
4. Cloudflare: ap dung rate limit POST `/api/image-admin` cho query
   `action=login` (neu goi hien tai ho tro); neu khong, bao ve `/admin/` va
   `/api/image-admin` bang Cloudflare Access chi cho email chu so huu.
   Khong vo tinh chan webhook/build cua Vercel hay truy cap chu so huu.
   API co throttling cuc bo, KHONG phai rate limit ben vung giua cac instance.
5. Dang nhap, doi mot anh thu, doi Vercel deploy hoan tat, kiem tra ca anh trong
   bai va anh tai Journal. Thu dang xuat va truy cap lai dashboard: phai bi tu choi.

Chua co secrets thi API tra 503 va khong cho doc/ghi. Khong co mat khau mac dinh.
Bat ky ai co mat khau quan tri deu co quyen sua anh; day chua phai dang nhap
theo danh tinh Google/GitHub hay MFA. Muon rang buoc dung mot nguoi, dung lop
Cloudflare Access o buoc 4 va khong chia se mat khau.

## Su dung

Tim bai > Doi anh > Tai anh tu may hoac Chon tu thu vien > nhap mo ta > Luu.
Anh upload toi da 2.9 MB, JPG/PNG/WebP tinh. Server kiem tra dinh dang, gioi han
pixel, chuyen WebP va resize toi da 1600px, khong crop, khong ve lai bao bi.
Anh moi duoc them vao GitHub; khong phu thuoc may tinh bat hay tat.

Luu se khoa lua chon rieng cua bai. Script sua anh cu ton trong khoa nay.
Bot dang bai moi khong sua lai cac bai da dang. Bai moi tu dong xuat hien trong
danh sach vi danh sach duoc doc tu nhanh main, khong phai danh sach co dinh.

Du lieu bai, thumbnail, queue va lich su duoc luu trong cung mot commit, khong
force-push. Neu co thay doi dong thoi, trang bao tai lai thay vi ghi de.
Vercel can deploy commit truoc khi anh hien tren website. Commit co `[skip ci]`
de khong phat sinh them bai/chi phi OpenAI moi lan doi anh.

Lich su toi da 20 lan trong giao dien; Git van giu lich su commit. Chon anh cu
trong muc Anh da dung va Luu de khoi phuc. Anh da xoa khoi thu vien khong the
khoi phuc bang nut nay; can khoi phuc file tu Git.

Ban dau chi doi tung bai, khong ap dung hang loat cho cung ten san pham de
tranh nham bien the. Thu vien hien ten tep va xem truoc; khong tu ket luan anh
dung san pham tu ten file. Nguoi quan tri xac nhan truoc khi luu.

## Kiem thu

`pnpm install` va `node --test tests/*.test.cjs`.
`node scripts/admin-preview.cjs` la ban xem UI tren localhost, chi doc,
khong dang nhap that va khong ghi GitHub; khong dua route preview len production.
