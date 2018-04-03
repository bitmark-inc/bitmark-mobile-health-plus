import {
  NativeModules,
} from 'react-native';
import moment from 'moment';
import { merge } from 'lodash';

import { AppleHealthKitModel } from './../apple-health-kit-model';
import studyCommonUtil from './common';

const InternationalDiabeteRenussionStudy = NativeModules.InternationalDiabeteRenussionStudy;
const InternationalDiabeteRenussionTask = NativeModules.InternationalDiabeteRenussionTask;

const surveysQuestion = {

  qa1: 'What is the language you would like to use for the app?',
  qa2: 'What is your biological gender?',
  qa3: 'What is your date of birth?',
  qa4: 'What is your height?',
  qa5: 'What is your weight?',
  qa6: 'Have you been tested for high insulin, high glucose or diabetes?',
  qa7: 'What was the result of the diabetes test?',
  qa8: 'What type of diabetes have you been diagnosed?',
  qa9: 'What are your working hours? Please select all that applies to you.',
  qa10: 'Please tell us at what time you usually wake up?',
  qa11: 'Please tell us at what time you usually go to bed?',
  qa12: 'Please tell us at what time you usually fall asleep?',
  qa13: 'Please tell us at what time you usually have your third main meal of the day?',
};

const surveysAnswers = {
  qa1: {
    'opt-1': 'English',
    'opt-2': 'Spanish (coming soon...)',
  },
  qa2: {
    'opt-1': 'Female',
    'opt-2': 'Male',
  },
  qa3: null,
  qa4: null,
  qa5: null,
  qa6: {
    'opt-1': 'Yes',
    'opt-2': 'No',
  },
  qa7: {
    'opt-1': "None",
    'opt-2': "Prediabetes",
    'opt-3': "Diabetes type 1",
    'opt-4': "Diabetes type 2",
    'opt-5': "Other type of diabetes",
  },
  qa8: null,
  qa9: {
    'opt-1': "Regular 8 hours",
    'opt-2': "Regular non 8 hours",
    'opt-3': "Morning",
    'opt-4': "Midday",
    'opt-5': "Evening",
    'opt-6': "Night",
    'opt-7': "Mixed shift",
  },
  qa10: null,
  qa11: null,
  qa12: null,
  qa13: null,
};

const checkIntakeAnswer = (answer) => {
  let answerQA09;
  if (answer['step-9'] && answer['step-9'].length > 0) {
    answerQA09 = [];
    answer['step-9'].forEach(item => {
      answerQA09.push(surveysAnswers['qa9'][item]);
    });
  }
  return [{
    question: surveysQuestion['qa1'],
    answer: surveysAnswers['qa1'][answer['step-1'][0]],
  }, {
    question: surveysQuestion['qa2'],
    answer: surveysAnswers['qa2'][answer['step-2'][0]],
  }, {
    question: surveysQuestion['qa3'],
    answer: moment(answer['step-3']).format('YYYY-MMM-DD'),
  }, {
    question: surveysQuestion['qa4'],
    answer: answer['step-4'],
  }, {
    question: surveysQuestion['qa5'],
    answer: answer['step-5'],
  }, {
    question: surveysQuestion['qa6'],
    answer: surveysAnswers['qa6'][answer['step-6']],
  }, {
    question: surveysQuestion['qa7'],
    answer: (answer['step-7'] && answer['step-7'].length > 0) ? surveysAnswers['qa7'][answer['step-7'][0]] : null,
  }, {
    question: surveysQuestion['qa8'],
    answer: answer['step-8'],
  }, {
    question: surveysQuestion['qa9'],
    answer: answerQA09,
  }, {
    question: surveysQuestion['qa10'],
    answer: answer['step-10'],
  }, {
    question: surveysQuestion['qa11'],
    answer: answer['step-11'],
  }, {
    question: surveysQuestion['qa12'],
    answer: answer['step-12'],
  }, {
    question: surveysQuestion['qa13'],
    answer: answer['step-13'],
  }];
};

const doConsentSurvey = (data) => {
  return new Promise((resolve) => {
    InternationalDiabeteRenussionStudy.showConsentSurvey(data, resolve);
  });
};
const doIntakeSurvey = () => {
  return new Promise((resolve) => {
    InternationalDiabeteRenussionStudy.showIntakeSurvey((ok, results) => {
      console.log(results);
      if (ok && results) {
        resolve(checkIntakeAnswer(results));
      } else {
        resolve(null);
      }
    });
  });
};

const checkActiveTask1Answer = (answer) => {
  let saveData = {
    value: answer['step-latestHbA1cValue']['formquestion1'] || answer['step-latestHbA1cValue']['formquestion2'],
    date: moment(answer['step-latestHbA1cDate']).format('YYYY/MM/DD'),
    type: answer['step-latestHbA1cValue']['formquestion1'] ? '%' : 'mmol/mol',
  }
  let result = [{
    question: "What's your newest value of  HbA1c (glycosylated hemoglobin)? ",
    answer: (answer['step-latestHbA1cValue']['formquestion1'] || answer['step-latestHbA1cValue']['formquestion2']) + ' ' + saveData.type,
  }, {
    question: 'Date of Measurement',
    answer: answer['step-latestHbA1cDate'],
  }];
  return {
    result: result,
    saveData: saveData,
  };
};
const checkActiveTask2Answer = (lastValue, answer) => {
  let result = [{
    question: 'Your last value of glycosylated hemoglobin (HbA1c) was ' + lastValue.value + lastValue.type + ' on ' + lastValue.date + '. Do you have a more recent value?',
    answer: answer['step-ask-recent-value'],
  }];
  let saveData;
  if (answer['step-ask-recent-value']) {
    saveData = {
      value: answer['step-latestHbA1cValue']['formquestion1'] || answer['step-latestHbA1cValue']['formquestion2'],
      date: moment(answer['step-latestHbA1cDate']).format('YYYY/MM/DD'),
      type: answer['step-latestHbA1cValue']['formquestion1'] ? '%' : 'mmol/mol',
    }
    result.push({
      question: "What's your newest value of  HbA1c (glycosylated hemoglobin)? ",
      answer: (answer['step-latestHbA1cValue']['formquestion1'] || answer['step-latestHbA1cValue']['formquestion2']) + ' ' + saveData.type,
    });
    result.push({
      question: 'Date of Measurement',
      answer: answer['step-latestHbA1cDate'],
    });
  }
  return {
    result: result,
    saveData: saveData,
  };
};
const checkActiveTask4Answer = (answer) => {
  return {
    textAnswer: [{
      question: 'In a few sentences, please explain your meal choices.',
      answer: answer['step-meal-text'],
    }],
    mediaAnswer: answer['step-meal-image'],
  };
};
const showActiveTask1 = () => {
  return new Promise((resolve) => {
    InternationalDiabeteRenussionTask.showActiveTask1((ok, results) => {
      if (ok && results) {
        resolve(checkActiveTask1Answer(results));
      } else {
        resolve(null);
      }
    });
  });
};
const showActiveTask2 = (oldData) => {
  return new Promise((resolve) => {
    InternationalDiabeteRenussionTask.showActiveTask2(oldData, (ok, results) => {
      if (ok && results) {
        resolve(checkActiveTask2Answer(oldData, results));
      } else {
        resolve(null);
      }
    });
  });
};
const showActiveTask3 = () => {
  return new Promise((resolve) => {
    InternationalDiabeteRenussionTask.showActiveTask3((ok) => {
      if (ok) {
        resolve({});
      } else {
        resolve(null);
      }
    });
  });
};
const showActiveTask4 = () => {
  return new Promise((resolve) => {
    InternationalDiabeteRenussionTask.showActiveTask4((ok, results) => {
      console.log('showActiveTask4 :', ok, results);
      if (ok && results) {
        resolve(checkActiveTask4Answer(results));
      } else {
        resolve(null);
      }
    });
  });
};

let getHealthKitData = (studyInformation, startDateString, endDateString) => {
  return new Promise(((resolve, reject) => {
    let options = {
      startDate: startDateString,
      endDate: endDateString,
    }
    AppleHealthKitModel.initHealthKit(studyInformation.dataTypes).then(() => {
      let promiseList = [];
      studyInformation.dataTypes.forEach((type) => {
        promiseList.push(AppleHealthKitModel['get' + type](options));
      });
      Promise.all(promiseList).then(results => {
        let mapResult = {};
        for (let index in results) {
          mapResult[studyInformation.dataTypes[index]] = results[index];
        }
        resolve(mapResult);
      }).catch(error => {
        reject(error);
      });
    }).catch(error => reject(error));
  }));
};

export default merge({}, studyCommonUtil, {
  doConsentSurvey: doConsentSurvey,
  doIntakeSurvey: doIntakeSurvey,
  showActiveTask1: showActiveTask1,
  showActiveTask2: showActiveTask2,
  showActiveTask3: showActiveTask3,
  showActiveTask4: showActiveTask4,
  getHealthKitData: getHealthKitData,
}) 