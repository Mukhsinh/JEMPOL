# MCP Supabase Configuration

## ✅ Configuration Created

MCP Supabase telah dikonfigurasi untuk workspace JEMPOL Platform.

### Configuration File
**Location:** `.kiro/settings/mcp.json`

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=jxxzbdivafzzwqhagwrf",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## 🔧 Configuration Details

- **Server Name:** `supabase`
- **Project Reference:** `jxxzbdivafzzwqhagwrf`
- **Status:** Enabled
- **Auto Approve:** None (manual approval required)

## 📋 How to Use

### 1. Reconnect MCP Server
Setelah konfigurasi dibuat, MCP server akan otomatis reconnect. Atau Anda bisa:
- Buka Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
- Cari: "MCP: Reconnect Server"
- Pilih "supabase"

### 2. View MCP Servers
- Buka Kiro Feature Panel
- Lihat section "MCP Server"
- Supabase server harus muncul dengan status "Connected"

### 3. Use Supabase Tools
Setelah connected, Anda bisa menggunakan Supabase tools melalui Kiro untuk:
- Query database
- Manage tables
- Execute SQL
- Manage authentication
- Storage operations
- Dan lainnya

## 🔐 Security Notes

### Auto Approve
Saat ini `autoApprove` kosong, artinya semua operasi memerlukan approval manual. Ini lebih aman untuk production.

Jika ingin auto-approve tool tertentu, tambahkan ke array:
```json
"autoApprove": ["query_database", "list_tables"]
```

### Project Reference
Project reference `jxxzbdivafzzwqhagwrf` adalah identifier unik untuk Supabase project Anda.

## 🛠 Troubleshooting

### MCP Server Not Connecting
1. Pastikan URL correct
2. Pastikan project reference valid
3. Cek network connection
4. Restart Kiro IDE

### Tools Not Available
1. Reconnect MCP server
2. Cek MCP Server view di Kiro
3. Pastikan server status "Connected"

### Permission Errors
1. Cek Supabase project permissions
2. Pastikan API keys valid (jika diperlukan)
3. Cek autoApprove settings

## 📚 Additional Configuration

### Add More MCP Servers
Edit `.kiro/settings/mcp.json`:
```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=jxxzbdivafzzwqhagwrf",
      "disabled": false,
      "autoApprove": []
    },
    "another-server": {
      "command": "npx",
      "args": ["-y", "@another/mcp-server"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Disable Supabase MCP
Set `disabled` to `true`:
```json
"supabase": {
  "url": "https://mcp.supabase.com/mcp?project_ref=jxxzbdivafzzwqhagwrf",
  "disabled": true,
  "autoApprove": []
}
```

## 🔗 Integration with JEMPOL Platform

### Potential Use Cases

1. **Database Migration**
   - Migrate dari MongoDB ke Supabase
   - Dual database support

2. **Authentication**
   - Supabase Auth untuk user management
   - Social login integration

3. **Storage**
   - Upload files ke Supabase Storage
   - Alternative untuk local uploads

4. **Real-time**
   - Real-time subscriptions untuk game leaderboard
   - Live visitor updates

5. **Analytics**
   - Query analytics data
   - Generate reports

## 📞 Support

**JEMPOL Platform**
- RSUD Bendan Kota Pekalongan
- Mukhsin Hadi: +62 857 2611 2001

**Supabase Documentation**
- https://supabase.com/docs
- https://supabase.com/docs/guides/api

**MCP Documentation**
- Check Kiro documentation for MCP usage

---

**Status:** ✅ MCP Supabase configured and ready
**Date:** December 5, 2025
**Project:** JEMPOL - Jembatan Pembayaran Online
