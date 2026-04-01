# Kiro + OpenClaw 协作运维指南

> 如何利用部署在 AWS 上的 OpenClaw（🦞 龙虾）与 Kiro 协调配合，安全可靠地运维 AWS 资源。

---

## 1. 概述

Kiro 是大脑，OpenClaw 是双手。

Kiro IDE/CLI 负责思考、编排和审查——开发者在 Kiro 中用自然语言描述意图，Kiro 将其转化为结构化的操作指令。OpenClaw 负责执行和交互——作为部署在 AWS EC2 上的 AI Agent 平台，它通过 MCP 工具和 Skills 直接操作 AWS 资源。

这种分工模式的核心优势：
- 人在 Kiro 端保持控制权，AI 在 OpenClaw 端执行操作
- 所有操作通过 SSM 加密通道传输，不暴露公网端口
- 资源变更类操作需要人工确认，查询类操作自动执行

## 2. 架构说明

完整的协作链路如下：

```
开发者 → Kiro IDE/CLI → SSM 端口转发 → OpenClaw Agent → MCP / Skills → AWS 服务
```

各层职责：

| 层级 | 组件 | 职责 |
|------|------|------|
| 交互层 | Kiro IDE / CLI | 开发者入口，自然语言交互，代码审查 |
| 传输层 | AWS SSM 端口转发 | 加密隧道，IAM 认证，无需公网端口 |
| 执行层 | OpenClaw Agent | AI 智能体，调用工具执行任务 |
| 工具层 | MCP Servers / Skills | AWS API、Cloud Control、Terraform 等 |
| 资源层 | AWS 服务 | EC2、VPC、RDS、S3、Bedrock 等 |

## 3. 安全设计

安全是这套协作模式的最高优先级。以下是多层安全防护机制：

### 3.1 网络安全：SSM 端口转发

- OpenClaw 仅绑定 `localhost:18789`，安全组入站规则为空，公网完全不可达
- 所有访问通过 SSM 端口转发建立加密隧道：
  ```bash
  aws ssm start-session --target <instance-id> \
    --document-name AWS-StartPortForwardingSession \
    --parameters '{"portNumber":["18789"],"localPortNumber":["18789"]}'
  ```
- SSM session 需要 IAM 认证，每次连接有审计日志

### 3.2 身份与权限：IAM 最小权限

- OpenClaw EC2 实例挂载专用 IAM Role，仅授予必要的服务权限
- 避免使用 Admin Role，按需配置：
  - EC2 管理：`ec2:Describe*`, `ec2:RunInstances`, `ec2:TerminateInstances`
  - VPC 管理：`ec2:CreateVpc`, `ec2:CreateSubnet` 等
  - RDS 管理：`rds:Create*`, `rds:Describe*`
  - Bedrock 调用：`bedrock:InvokeModel`
- 敏感操作（如删除资源）建议通过 SCP 或权限边界限制

### 3.3 MCP 审批策略

MCP Server 的 `autoApprove` 配置决定了哪些操作自动执行、哪些需要人工确认：

| MCP Server | autoApprove | 说明 |
|---|---|---|
| AWS Knowledge | `["*"]` | 只读查询，自动执行 |
| AWS Documentation | `["*"]` | 只读查询，自动执行 |
| AWS Cloud Control API | `[]` | 资源变更，每次需确认 |
| AWS API | `[]` | CLI 操作，每次需确认 |
| Terraform | `["*"]` | IaC 建议和检查，自动执行 |

### 3.4 审计与监控

- AWS CloudTrail 记录所有 API 调用，可追溯每一次资源变更
- SSM Session Manager 记录所有 session 日志
- OpenClaw 自身记录对话历史和工具调用日志
- 建议配置 CloudWatch Alarms 监控异常 API 调用

## 4. 已接入的 MCP 工具

### 4.1 AWS Knowledge MCP Server
- 用途：查询 AWS 产品知识、最佳实践、架构建议
- 场景：「这个场景应该用 RDS 还是 DynamoDB？」「VPC 的最佳实践是什么？」
- 类型：远程托管（HTTP），无需本地安装

### 4.2 AWS Documentation MCP Server
- 用途：搜索和查询 AWS 官方文档
- 场景：「查一下 EC2 的实例类型对比」「SSM 端口转发的文档在哪？」
- 运行方式：`uvx awslabs.aws-documentation-mcp-server@latest`

### 4.3 AWS Cloud Control API MCP Server
- 用途：通过 Cloud Control API 创建和管理 1100+ 种 AWS 资源
- 场景：「创建一个 t3.medium 的 EC2 实例」「新建一个 S3 桶」
- 安全：每次操作需人工确认，不自动执行
- 运行方式：`uvx awslabs.ccapi-mcp-server@latest`

### 4.4 AWS API MCP Server
- 用途：通过 AWS CLI 命令管理基础设施
- 场景：「查看当前所有运行中的 EC2 实例」「修改安全组规则」
- 安全：每次操作需人工确认
- 运行方式：`uvx awslabs.aws-api-mcp-server@latest`

### 4.5 Terraform MCP Server
- 用途：IaC 最佳实践建议、基础设施代码模式、Checkov 安全合规检查
- 场景：「帮我写一个 Terraform 模块部署 VPC + EC2」「检查这个 Terraform 代码的安全性」
- 运行方式：`uvx awslabs.terraform-mcp-server@latest`

## 5. 安全与可控性：为什么这种方式比传统运维更安全

AI 驱动运维最大的顾虑不是"能不能做"，而是"会不会失控"。这套 Kiro + OpenClaw 协作模式从架构层面解决了这个问题。

### 5.1 人始终在回路中（Human-in-the-Loop）

这不是一个"AI 自己干活"的系统，而是"AI 提议，人决策"的系统：

- 资源变更类操作（创建/删除/修改 EC2、VPC、RDS 等）的 MCP autoApprove 设为空，每次操作都会暂停等待人工确认
- Kiro 作为中间层，开发者可以在 Kiro 中审查 OpenClaw 即将执行的操作，确认无误后再放行
- 即使 OpenClaw 生成了错误的操作指令，人工审批环节可以拦截

对比传统方式：运维人员直接在终端敲命令，一个 `rm -rf` 或错误的安全组规则就可能造成事故。AI 驱动的方式反而多了一层"AI 生成 → 人审查 → 再执行"的缓冲。

### 5.2 网络零暴露

传统运维通常需要 SSH 端口（22）对外开放，或者通过 VPN 接入。这套方案：

- OpenClaw 绑定 localhost，安全组入站规则为空，公网完全不可达
- 所有访问通过 SSM 端口转发，走 AWS 内部加密通道
- 不需要 SSH 密钥管理，消除密钥泄露风险
- 不需要 VPN，减少网络攻击面

即使攻击者知道 EC2 的公网 IP，也无法访问 OpenClaw 的任何端口。

### 5.3 权限分层与最小化

权限设计遵循纵深防御原则：

| 层级 | 控制机制 | 说明 |
|------|---------|------|
| IAM Role | 最小权限策略 | EC2 实例角色仅授予必要的 AWS 服务权限 |
| MCP autoApprove | 操作审批 | 资源变更类工具不自动执行，需人工确认 |
| OpenClaw sandbox | 执行隔离 | Agent 在沙箱中运行，限制文件系统和网络访问 |
| tools.allow/deny | 工具白名单 | 可配置 OpenClaw 只允许调用特定工具 |
| SCP / 权限边界 | 组织级管控 | 通过 AWS Organizations 限制账号级别的操作上限 |

即使 AI 产生了"幻觉"想执行危险操作，多层权限控制会逐级拦截。

### 5.4 全链路可审计

每一步操作都有迹可循：

- AWS CloudTrail：记录所有 AWS API 调用，谁在什么时间对什么资源做了什么操作
- SSM Session 日志：记录每次 SSM 连接的发起者、时间、持续时长
- OpenClaw 对话历史：记录每次 AI 交互的完整上下文，包括用户指令和 AI 响应
- MCP 工具调用日志：记录每个 MCP 工具的输入参数和返回结果

出了问题可以完整回溯：是谁发起的 → Kiro 传达了什么指令 → OpenClaw 调用了什么工具 → AWS 执行了什么操作。

### 5.5 IaC 优先，避免配置漂移

直接用 CLI 修改资源会导致"配置漂移"——实际状态和代码定义不一致。这套方案推荐：

- 优先使用 Terraform MCP 生成 IaC 代码，而不是直接执行 AWS CLI
- Kiro 审查 IaC 代码后，通过 OpenClaw 执行 `terraform apply`
- 所有基础设施变更都有代码记录，可版本控制、可回滚
- Checkov 安全合规检查在部署前自动运行，拦截不合规的配置

### 5.6 与传统运维方式的安全性对比

| 维度 | 传统 SSH 运维 | Kiro + OpenClaw |
|------|-------------|-----------------|
| 网络暴露 | SSH 端口对外开放 | 零端口暴露，SSM 加密隧道 |
| 认证方式 | SSH 密钥（易泄露） | IAM 身份认证（可 MFA） |
| 操作审批 | 无，直接执行 | MCP 审批机制，人工确认 |
| 操作审计 | 依赖 bash history | CloudTrail + SSM 日志 + 对话历史 |
| 误操作防护 | 无 | AI 生成 → 人审查 → 再执行 |
| 配置管理 | 手动修改，易漂移 | IaC 优先，版本可控 |
| 权限控制 | root 或 sudo | IAM 最小权限 + 多层拦截 |

## 6. 典型运维场景

### 6.1 部署新资源
开发者在 Kiro 中说「帮我在 us-east-1 创建一个 t3.medium 的 EC2 实例，用 Ubuntu 24.04」→ Kiro 通过 SSM 连接 OpenClaw → OpenClaw 调用 Terraform MCP 生成 IaC 代码 → Kiro 展示代码供审查 → 确认后 OpenClaw 执行部署。

### 6.2 故障排查
「OpenClaw 没响应了」→ Kiro 通过 SSM 让 OpenClaw 检查服务状态、读取日志、定位问题 → 生成修复方案 → 人工确认后执行修复。

### 6.3 安全审计
「检查一下当前的安全组配置是否合规」→ OpenClaw 调用 AWS API MCP 查询安全组规则 → 调用 Terraform MCP 的 Checkov 进行合规检查 → 输出审计报告。

### 6.4 模型切换
「把 AI 模型换成 Claude Sonnet 4.6」→ OpenClaw 修改配置文件 → 重启 Gateway → 验证新模型响应正常。

## 7. 最佳实践

1. **IaC 优先**：所有基础设施变更通过 Terraform/CloudFormation 代码实现，不直接用 CLI 修改
2. **最小权限**：IAM Role 只授予当前任务所需的最小权限，定期审查和收缩
3. **操作审批**：资源变更类 MCP 工具保持 autoApprove 为空，每次人工确认
4. **定期审计**：定期检查 CloudTrail 日志、安全组规则、IAM 策略
5. **沙箱执行**：OpenClaw 的 Agent 在 sandbox 模式下运行，限制文件系统和网络访问
6. **版本控制**：所有配置文件和 IaC 代码纳入 Git 管理
7. **备份策略**：关键资源配置定期备份，确保可回滚

## 8. 风险提示

- AI 可能产生"幻觉"，生成看似合理但实际错误的操作指令。务必在 Kiro 端审查后再执行
- SSM session 有超时机制，长时间操作可能中断，需要重新建立连接
- MCP 工具依赖网络连接，如果 VPC Endpoint 配置不当可能导致工具不可用
- OpenClaw 的 EC2 实例本身也需要定期更新补丁和安全扫描
- 不建议将此方案用于生产环境的关键操作，除非经过充分测试和审批流程验证

---

*本文档由 Kiro + OpenClaw 协作生成，Bar1 | 八一 · GenAI 体验中心*
