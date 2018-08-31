import moment from 'moment';


let generateSurveyAsset = (studyInformation, bitmarkAccount, donateData, donateDataType, donateDate, platform, randomId) => {
  return {
    assetName: studyInformation.studyCode + '_' + bitmarkAccount.substring(bitmarkAccount.length - 8, bitmarkAccount.length) +
      '_' + moment(donateDate).format('YYYY_MMM_DD_HH_mm_ss') + '_' + randomId,
    assetMetadata: {
      Creator: bitmarkAccount,
      Created: moment(donateDate).format('YYYY MMM DD HH:mm:ss'),
    },
    assetType: donateDataType,
    date: donateDate,
    randomId: randomId,
    data: JSON.stringify({
      study: studyInformation.title,
      donor: bitmarkAccount,
      date: moment(donateDate).format('YYYY MMM DD'),
      data: [{
        platform: platform,
        data_type: donateDataType,
        donated_data: donateData,
      }]
    }),
  };
};

let generateHealthKitAsset = (studyInformation, bitmarkAccount, donateData, donateDataType, donateDate, randomId) => {
  return {
    assetName: studyInformation.studyCode + '_' + bitmarkAccount.substring(bitmarkAccount.length - 8, bitmarkAccount.length) +
      '_' + moment(donateDate).format('YYYY_MMM_DD_HH_mm_ss') + '_' + randomId,
    assetMetadata: {
      Creator: bitmarkAccount,
      'Created (date)': moment(donateDate).format('YYYY MMM DD HH:mm:ss'),
      Source: 'HealthKit',
      Relation: studyInformation.studyCode,
    },
    assetType: donateDataType,
    date: donateDate,
    randomId: randomId,
    data: JSON.stringify({
      study: studyInformation.title,
      donor: bitmarkAccount,
      date: moment(donateDate).format('YYYY MMM DD'),
      data: [{
        platform: 'HealthKit',
        donated_data: donateData,
      }]
    }),
  };
};

let getMetadataOfBitmarkHealthData = (bitmarkAccount, ) => {
  return {
    Creator: '[' + bitmarkAccount.substring(0, 4) + '...' + bitmarkAccount.substring(bitmarkAccount.length - 4, bitmarkAccount.length) + ']',
    'Created (date)': 'YYYY MMM DD HH:mm:ss',
  };
};

export default {
  generateSurveyAsset,
  generateHealthKitAsset,
  getMetadataOfBitmarkHealthData,
};