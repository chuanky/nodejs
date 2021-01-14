## 项目使用流程

1. 下载wikidata JSON dump文件
2. 使用json_dump_processor.js的JSONDumpProcessor类处理JSON dump文件，文件大小：1.1T -> 115G，文件过滤后变为JSON Line文件。
3. 使用main.js根据Claims筛选出目标实体，运行过后生成3个文件，分别对应人物、组织、地点实体。
4. 使用entity_matcher.js匹配wikidata和iricaDB中的实体，[详情](知识库匹配率统计_2020-01-14.md)。
5. 使用matched_person_processor.js统计可更新的数据库字段。
