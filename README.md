# Kids Online Safety Guide — Bark 推广落地页

一个 Google Ads 合规的**静态评测落地页**，用于推广 MaxBounty Bark offer (#24645)。
纯 HTML/CSS/JS，无需构建步骤，可直接部署到任意静态托管（推荐 Cloudflare Pages 或 Netlify，均自带免费 HTTPS）。

> 配套指南：
> - 追踪搭建 → `../SETUP-TRACKING.md`
> - Google Ads 投放与优化 → `../SETUP-GOOGLE-ADS.md`

---

## 1. 文件结构
```
site/
  index.html        # 主评测/对比页（订阅角度）
  privacy.html      # 隐私政策（Google 审核必备）
  disclosure.html   # Affiliate 披露（合规必备）
  about.html        # 关于/联系（增强信任）
  assets/styles.css # 样式（移动优先）
  assets/main.js    # 捕获 gclid + CTA 跳转 tracker + gtag 事件
  README.md         # 本文件
```

---

## 2. 上线前必须回填的 3 个占位符

| 占位符 | 含义 | 在哪里拿 | 出现位置 |
|---|---|---|---|
| `{{YOUR_DOMAIN}}` | 你的落地页域名（如 `kidsonlinesafetyguide.com`） | 第 4 步买域名后 | 所有 .html 的 canonical / 文案 |
| `{{GTAG_ID}}` | Google 跟踪代码 ID（`G-XXXX` 或 `AW-XXXX`） | 见 `SETUP-GOOGLE-ADS.md` | 所有 .html 的 `<head>` |
| `{{TRACKER_CAMPAIGN_URL}}` | 你的 tracker campaign 跳转链接 | 见 `SETUP-TRACKING.md` | `assets/main.js` 顶部 |

> ⚠️ 占位符没填之前：CTA 按钮**故意不可点**（main.js 检测到未配置会让按钮失效），避免把用户送到错误地址。三个全部填好后 CTA 才会跳转。

回填方式：用任意文本编辑器全局替换，或上线后在托管平台里改。**三处都要改，缺一不可。**

---

## 3. 本地预览
任意静态服务器即可，例如（已装 Python）：
```bash
cd site
python -m http.server 8080
# 浏览器打开 http://localhost:8080
```
检查：页面正常、隐私/披露/关于三个链接可点、移动端布局正常。
（此时 CTA 还不能跳转，属正常——要等占位符回填。）

---

## 4. 买域名（你目前没有）
1. 到 Namecheap / Cloudflare Registrar / Porkbun 注册一个**与"家长监控/儿童安全"相关、可信**的域名。
   - ✅ 例：`kidsonlinesafetyguide.com`、`familyscreenguide.com`、`safekidsreview.com`
   - ❌ 不要含 `bark`（商标）；不要用免费二级域名（信任度低、易被 Google 判低质）。
2. 如果用 Cloudflare Registrar 买，后面接 Cloudflare Pages 部署最顺。

---

## 5. 部署到 Cloudflare Pages（推荐，免费 + 自动 HTTPS）
**方式 A：直接拖拽上传（最简单，无需 Git）**
1. 登录 [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create → Pages → **Upload assets**。
2. 把 `site/` 文件夹里的内容（注意是文件夹**内部**的文件，让 `index.html` 在根目录）打包上传。
3. 部署完成会给你一个 `*.pages.dev` 临时地址，先验证页面正常。
4. Custom domains → 添加你买的域名 → 按提示设置 DNS（Cloudflare 买的域名自动接管）→ 等待 HTTPS 签发。

**方式 B：连 Git 自动部署（推荐长期维护）**
1. 把 `site/` 作为仓库根目录推到 GitHub。
2. Cloudflare Pages → Connect to Git → 选仓库 → 构建命令留空、输出目录设为 `/`（纯静态）。
3. 之后每次 push 自动重新部署。

> Netlify 步骤几乎一样：Add new site → Deploy manually 拖拽 `site/`，或连 Git；Domain settings 绑定域名。

### 也可以部署到 GitHub Pages（免费）
1. 新建一个 GitHub 仓库，把 `site/` 里的文件**放到仓库根目录**（让 `index.html` 在根）。
2. 仓库 → Settings → Pages → Source 选 `main` 分支、根目录 `/` → Save。
3. Settings → Pages → **勾选 Enforce HTTPS**。
4. 自定义域名：在 Pages 里填你的域名，仓库根加一个 `CNAME` 文件（内容=你的域名），并在 DNS 商把域名 CNAME 指到 `你的用户名.github.io`。
5. 之后每次 push 自动更新。

**静态站 vs WordPress 的安全性（你问的第 5 点）**：静态站**几乎不需要 WordPress 那套安全措施**——没有服务器/数据库/PHP/插件，就没有后台登录被爆破、SQL 注入、插件漏洞、需要打补丁这些问题。你真正要做的只有：① 给 GitHub 账号开 **2FA**（账号被盗才是唯一现实风险）；② 开 **Enforce HTTPS**；③ 别往仓库提交任何私密信息（本项目没有密钥，tracker 链接和 gtag ID 本来就是前端公开的）。无需防火墙、安全插件、杀毒扫描、备份（代码都在 git 里）。
> 想要 CDN 加速 + 隐藏源站 + 抗 DDoS，可改用 **Cloudflare Pages**（同样免费，对联盟落地页略优）；但 GitHub Pages 完全够用。

---

## 6. 上线后自检清单
- [ ] `https://你的域名/` 能正常打开，有锁（HTTPS 生效）
- [ ] `/privacy.html`、`/disclosure.html`、`/about.html` 都能打开
- [ ] 三个占位符已全部回填并重新部署
- [ ] 点 CTA 能跳到 tracker → 再跳 Bark 官网（配合 SETUP-TRACKING.md 自测）
- [ ] 手机上排版正常、CTA 按钮明显
- [ ] 用 Google Ads 着陆页政策自查：内容原创、有隐私/披露、非纯跳转桥页

---

## 7. 合规要点（务必保持）
- 落地页是**独立评测内容**，不是"点广告→立即跳转"的桥页 —— 这是 Google 不封号的关键。
- 页面/文案**不冒充 Bark 官方**，footer 已声明"独立、非官方、商标归属"。
- 广告关键词与文案**绝不含 "Bark" 品牌词**（MaxBounty + Google 双重禁止）。
- 不做 coupon / 优惠码角度（offer 禁止）。
- CTA 链接已标记 `rel="sponsored nofollow"`（affiliate 最佳实践）。
