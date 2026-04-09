<script setup>
import { computed } from 'vue'

const apiBase = computed(() => import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000')
</script>

<template>
  <div class="page-full">
    <div class="page-full-title">平台操作指南</div>
    <div class="page-full-body">
      <div class="card">
        <div class="card-title">快速开始</div>
        <div class="card-body">
          <ol class="steps">
            <li>登录系统（未注册先注册一个账号）。</li>
            <li>进入“配置管理”，设置 base_url，并配置 AI 模型（API Key、Endpoint、模型 ID）。</li>
            <li>进入“用例管理”，上传 OpenAPI/Swagger 文档文件并生成 CSV 测试用例。</li>
            <li>在“用例管理”可查看/编辑 CSV（仅 CSV 支持编辑）并保存覆盖原文件。</li>
            <li>进入“执行测试”，选择 CSV 用例文件，开始执行，等待生成 HTML 报告。</li>
            <li>进入“测试报告”，查看/删除报告。</li>
          </ol>
        </div>
      </div>

      <div class="card">
        <div class="card-title">1. 登录与会话</div>
        <div class="card-body">
          <ul class="list">
            <li>登录成功后会保存登录凭证，接口请求会自动携带并在失效时尝试续期。</li>
            <li>退出登录会清理本地凭证。</li>
          </ul>
        </div>
      </div>

      <div class="card">
        <div class="card-title">2. 配置管理（base_url 与 AI）</div>
        <div class="card-body">
          <div class="sub-title">2.1 base_url</div>
          <ul class="list">
            <li>base_url 用于拼接完整请求地址：base_url + CSV 中的 请求URL。</li>
            <li>base_url 支持下拉选择历史记录，也可手动输入新地址，点击保存后会自动加入下拉候选。</li>
          </ul>
          <div class="sub-title">2.2 AI 配置</div>
          <ul class="list">
            <li>在“AI 功能”里配置模型列表，并选择一个“启用模型”。</li>
            <li>生成用例时会使用启用的模型进行 AIGC 生成。</li>
          </ul>
          <div class="hint">
            后端服务地址来自前端环境变量 VITE_API_BASE：<span class="mono">{{ apiBase }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">3. 用例管理（生成 / 查看 / 编辑 / 下载）</div>
        <div class="card-body">
          <div class="sub-title">3.1 生成测试用例（仅文件上传）</div>
          <ol class="steps">
            <li>选择 OpenAPI/Swagger 文档文件。</li>
            <li>设置输出文件名（仅支持英文/数字/下划线）。</li>
            <li>点击“生成测试用例”，会创建生成任务并显示进度条。</li>
            <li>生成完成后，会在文件列表看到新的 CSV 文件。</li>
          </ol>
          <div class="sub-title">3.2 模型回复</div>
          <ul class="list">
            <li>页面默认展示“预览内容”（避免轮询接口返回过大）。</li>
            <li>点击“查看完整”会按需拉取完整模型回复（同一次生成不会重复请求）。</li>
          </ul>
          <div class="sub-title">3.3 CSV 查看与编辑</div>
          <ul class="list">
            <li>文件列表的“查看”图标仅对 CSV 显示。</li>
            <li>弹窗中以表格方式编辑，点击“保存”会覆盖写回当前 CSV 文件，不会新建文件。</li>
          </ul>
          <div class="sub-title">3.4 下载与删除</div>
          <ul class="list">
            <li>下载采用短期签名链接，不会在地址栏暴露登录凭证。</li>
            <li>删除会删除当前用户目录下对应文件，其他用户不可见也不可操作。</li>
          </ul>
        </div>
      </div>

      <div class="card">
        <div class="card-title">4. 执行测试（任务化）</div>
        <div class="card-body">
          <ul class="list">
            <li>仅支持选择 CSV 用例文件进行执行。</li>
            <li>点击“开始执行”会创建任务并显示进度，完成后会生成 HTML 报告。</li>
            <li>历史执行记录会显示报告信息，可一键跳转到报告页查看。</li>
          </ul>
        </div>
      </div>

      <div class="card">
        <div class="card-title">5. 测试报告（查看 / 删除）</div>
        <div class="card-body">
          <ul class="list">
            <li>报告列表展示报告名称、大小、时间。</li>
            <li>点击“查看”会打开报告（签名 URL）。</li>
            <li>删除报告后列表与首页统计会同步更新。</li>
          </ul>
        </div>
      </div>

      <div class="card">
        <div class="card-title">常见问题</div>
        <div class="card-body">
          <div class="sub-title">1）生成失败：missing ai config</div>
          <div class="text">请先在“配置管理”完成 AI 模型配置，并选择一个“启用模型”。</div>
          <div class="sub-title">2）执行失败：empty url / placeholders</div>
          <div class="text">检查 CSV 中 请求URL 是否为空，是否包含 {id} 这类占位符。</div>
          <div class="sub-title">3）请求失败：接口 401</div>
          <div class="text">登录过期时系统会自动续期；若仍失败，退出重新登录。</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-full {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f8ff;
}
.page-full-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  background: #fff;
}
.page-full-body {
  flex: 1;
  padding: 16px;
  color: #333;
  overflow: auto;
}
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
  border: 1px solid #eef2ff;
  margin-bottom: 16px;
}
.card-title {
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  border-bottom: 1px solid #eef2ff;
}
.card-body {
  padding: 14px 16px;
  color: #334155;
  line-height: 1.7;
  font-size: 14px;
}
.steps {
  margin: 0;
  padding-left: 18px;
}
.steps li {
  margin: 6px 0;
}
.list {
  margin: 0;
  padding-left: 18px;
}
.list li {
  margin: 6px 0;
}
.sub-title {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}
.text {
  margin-top: 6px;
  color: #334155;
}
.hint {
  margin-top: 10px;
  padding: 10px 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #475569;
  word-break: break-all;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>
