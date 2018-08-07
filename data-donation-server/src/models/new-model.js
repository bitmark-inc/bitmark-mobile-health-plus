const database = global.server.database;
const squel = global.server.database.squel;

// ================================================================================================================
// ================================================================================================================
const doInsertNewInformation = async (newsInformation, ) => {
  const query = squel.insert().into('data_donation.news')
    .set('publisher', newsInformation.publisher)
    .set('title', newsInformation.title)
    .set('researcher_image_url', newsInformation.researcherImageUrl)
    .set('description', newsInformation.description ? newsInformation.description : null)
    .toParam();
  await database.executeQuery(query);
};

const doUpdateNewInformation = async (newsInformation, ) => {
  let query = squel.update().table('data_donation.news')
    .set('publisher', newsInformation.publisher)
    .set('title', newsInformation.title)
    .set('description', newsInformation.description ? newsInformation.description : null)
    .set('researcher_image_url', newsInformation.researcherImageUrl)
    .where("id = ?", newsInformation.id)
    .toParam();
  await database.executeQuery(query);
};
// ================================================================================================================
// ================================================================================================================

const doGetAllNewsInformation = async () => {
  const query = squel.select().from('data_donation.news').order('created_at').toParam();
  let returnedData = await database.executeQuery(query);
  let results = [];
  if (returnedData && returnedData.rows && returnedData.rows.length > 0) {
    returnedData.rows.forEach(row => {
      let newsInformation = {
        id: row.id,
        publisher: row.publisher,
        createdAt: row.created_at,
        title: row.title,
        description: row.description,
        researcherImageUrl: row.researcher_image_url,
      };
      results.push(newsInformation);
    });
  }
  return results;
};

module.exports = {
  doInsertNewInformation,
  doUpdateNewInformation,
  doGetAllNewsInformation,
};
