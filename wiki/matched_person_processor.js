const MatchedEntityProcessor = require('./matched_entity_processor');
const PersonEntity = require('./person_entity');
const DateUtil = require('../util/date_util');
const Logger = require('../test_field/logger')

class MatchedPersonProcessor extends MatchedEntityProcessor {
  constructor(inputFile) {
    super(inputFile);
    this.logger = new Logger('debug', 'file', `../data/matched_per_processor.log`);
    this.result = {
      'name_en': 0, 'name_zh': 0, 'name_zf': 0, 'name_ru': 0, 'name_ja': 0,
      'countryId': 0,
      'jobTitle_en': 0, 'jobTitle_zh': 0,
      'birthday': 0,
      'photoUrl': 0,
      'wpurl_en': 0, 'wpurl_zh': 0, 'wpurl_zf': 0, 'wpurl_ru': 0, 'wpurl_ja': 0,
      'partyName': 0,
      'description': 0, 'description_zh': 0, 'description_zf': 0, 'description_ru': 0, 'description_ja': 0,
      'aliases': 0,
      'sourceTag': 0,
      'updateTime': 0
    };

    this.rl.on('close', () => {
      setTimeout(() => {
        this.logger.info(`Total number of Entity: ${this.counter}; Total processed: ${this.processed}`);
        console.log(this.result)
      }, 2000);
    })
  }

  process() {
    this.rl.on('line', (line) => {
      this.counter++;
      let entity_pair = JSON.parse(line);
      let wiki_entity = new PersonEntity(entity_pair['wikidata'], this.con, this.con_irica);
      let db_entity = entity_pair['iricaDB'];
    
      // 统计可更新信息,wikidata中职位、党派信息为id, 需要数据库访问得到label
      this.update(wiki_entity, db_entity, this.result);
    
      if (this.counter % 100 == 0) {
        this.rl.pause();
        this.logger.info(`pausing for 100ms, processed: ${this.counter}`)
        // setTimeout(() => rl.resume(), 100);
        setTimeout(() => this.rl.close(), 1000);
      }
    });
  }

  /**
   * @param {PersonEntity} wiki_entity 
   */
  update = async (wiki_entity, db_entity, result) => {
    let job = await wiki_entity.getJob();
    let party = await wiki_entity.getParty();
    let countryId = await wiki_entity.getCountry('per');
    this.logger.debug(`${wiki_entity.getId()}: ${wiki_entity.getLabel('en')} ---- ${db_entity['id']}: ${db_entity['name_en']}`)
    this.updateMultiLangFields(wiki_entity.getNames(), db_entity, result);
    this.updateMultiLangFields(wiki_entity.getWikiUrls(), db_entity, result);
    this.updateMultiLangFields(wiki_entity.getDescriptions(), db_entity, result, true);
    this.updateField(countryId, db_entity, result, 'countryId');
    this.updateField(wiki_entity.getBirthday(), db_entity, result, 'birthday');
    this.updateField(wiki_entity.getPhotoUrl(), db_entity, result, 'photoUrl');
    this.updateField(party, db_entity, result, 'partyName');
    this.updateMultiLangFields(job, db_entity, result);
    this.updateField(wiki_entity.getAliases(), db_entity, result, 'aliases', true);
    this.appendFieldValue('wikidata-2020-12-28', db_entity, result, 'sourceTag')
    this.updateField(DateUtil.getUTCDateTime(), db_entity, result, 'updateTime', true);
    this.processed++;
  }
}

new MatchedPersonProcessor('E:/wikidata/per_matched-2020-12-28.jl_unique').process();