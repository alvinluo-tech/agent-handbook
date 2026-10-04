import { Chapter } from '../components/Bits.jsx'
import { FigRag } from '../components/Diag2.jsx'

export default function Ch10() {
  return (
    <Chapter ch={{
      id: 'ch10', num: 'CH.10', icon: '📚', title: 'RAG 与知识工程', en: 'RAG & KNOWLEDGE ENGINEERING', mins: 16,
      quests: ['能画出 RAG 双流水线', '知道切块/嵌入/重排的关键参数', '理解 Agentic RAG 与传统 RAG 差异', '知道什么时候该 RAG、什么时候该长上下文'],
    }}>
      <p>RAG(Retrieval-Augmented Generation,2020 年 Lewis 等人的论文开山)解决一个朴素的问题:<strong>模型不知道你的私有知识,或者知道但过期了</strong>。与其重新训练,不如开卷考试——先检索,后作答。对 Agent 而言,RAG 是「知识供应系统」,也是记忆语义层(CH.09)的地基。</p>

      <FigRag />

      <h3>10.1 双流水线与关键参数</h3>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>环节</th><th>要紧事</th><th>踩坑点</th></tr></thead>
          <tbody>
            <tr><td><b>切块 Chunking</b></td><td>块大小 300-800 token 起步;保留标题/章节等结构元数据</td><td>一刀切会把表格/代码切得支离破碎 → 结构感知切块</td></tr>
            <tr><td><b>嵌入 Embedding</b></td><td>选多语言模型(bge-m3 / text-embedding-3 等);同一库用同一模型</td><td>换模型必须全量重建索引</td></tr>
            <tr><td><b>检索 Retrieve</b></td><td>Top-K 从 5-20 试起;混合检索(向量+BM25 关键词)通常更稳</td><td>纯向量对专有名词/编号的精确匹配可能不足，需测召回</td></tr>
            <tr><td><b>重排 Rerank</b></td><td>用 cross-encoder(bge-reranker / cohere-rerank)把 K 压到 3-5</td><td>跳过重排,窗口里全是噪声块</td></tr>
            <tr><td><b>生成 Generate</b></td><td>注入时带来源引用;答不出就说答不出</td><td>强制「必须回答」会逼出幻觉</td></tr>
          </tbody>
        </table>
      </div>

      <h3>10.2 进化树:从朴素 RAG 到 Agentic RAG</h3>
      <ul className="steps">
        <li><b>朴素 RAG</b>一次检索一次生成。简单场景可先建立基线；复杂问题可能需要查询改写、多跳检索或结构化数据，是否升级由召回评测决定。</li>
        <li><b>进阶版</b>查询改写(HyDE/多查询)、混合检索、重排、CRAG(检索质量自评,不行就补检索/联网)。</li>
        <li><b>GraphRAG</b>微软 2024:把语料抽成实体关系图再社区摘要,擅长「全局性/总结性」问题(如「这批文档的主要主题是什么」)。</li>
        <li><b>Agentic RAG</b>(2025 主流)检索成为 Agent 手里的<strong>工具</strong>:模型决定查不查、查什么、查几轮、结果够不够好。问题复杂度上不封顶,代价是延迟与 token。</li>
      </ul>
      <p>2025-2026 的现实是:向量库(Chroma/Qdrant/Milvus)+ 重排 + agent 化调度,组成了 RAG 基建「新三件」;RAGFlow、LightRAG这类一体化引擎则把整条流水线打包开源。</p>

      <h3>10.3 灵魂拷问:长上下文会杀死 RAG 吗?</h3>
      <div className="grid2">
        <div className="card idea">
          <span className="card-tag">「塞进去就行」派</span>
          <p style={{ margin: 0 }}>1M token 窗口,直接把整个仓库塞进去?——小语料(单本文档、几个代码文件)确实可以,还免去索引维护。但:<strong>输入计费通常随 token 量增加，预填充延迟受架构、缓存与服务影响；长上下文检索也可能衰减，多用户重复输入需结合缓存评估</strong>。</p>
        </div>
        <div className="card tip">
          <span className="card-tag">现实共识</span>
          <p style={{ margin: 0 }}>两者是互补不是替代:<strong>小而稳定 → 长上下文直塞;大/动态/多租户 → RAG</strong>。实践中最常见的架构是混合:常驻的核心上下文(人设+规则+当前任务)+ 检索进来的长尾知识。Anthropic 的说法:用「检索」替代「背诵」——人类专家也是这么干的。</p>
        </div>
      </div>

      <div className="card warn">
        <span className="card-tag">避坑 · RAG 项目失败 Top3</span>
        ① <strong>评估缺失</strong>:不建金标集就上线,效果全凭感觉(RAGAS 框架先跑起来,CH.15);② <strong>切块毁文档</strong>:PDF 表格、代码库被切碎 → 用结构感知解析(docling/unstructured);③ <strong>只调参数不问问题</strong>:很多「检索不准」其实是「用户问题本身含糊」→ 上查询改写与澄清追问。
      </div>
    </Chapter>
  )
}
