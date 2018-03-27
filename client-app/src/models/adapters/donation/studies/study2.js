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
  qa1: 'Do you speak English? (the study is only available in English)',
  qa2: 'Are you willing to use your camera app to take photos and videos for the study?',
  qa3: 'Are you 18 years or older?',
  qa4: 'Are you currently a student from UC Berkeley?',

  qa8: 'Do you agree with consent?',

  qa9: 'What is the language you would like to use for the app?',
  qa10: 'What is your biological gender?',
  qa11: 'What is your date of birth?',
  qa12: 'What is your height?',
  qa13: 'What is your weight?',
  qa14: 'Have you been tested for high insulin, high glucose or diabetes?',
  qa15: 'What was the result of the diabetes test?',
  qa16: 'What type of diabetes have you been diagnosed?',
  qa17: 'What are your working hours? Please select all that applies to you.',
  qa18: 'Please tell us at what time you usually wake up?',
  qa19: 'Please tell us at what time you usually go to bed?',
  qa20: 'Please tell us at what time you usually fall asleep?',
  qa21: 'Please tell us at what time you usually have breakfast or first beverage with caloric content?',
  qa22: 'Please tell us at what time you usually have your second main meal of the day?',
  qa23: 'Please tell us at what time you usually have your third main meal of the day?',
  qa24: 'Please tell us at what time you usually have your first walk or exercise bout of the day?',
  qa25: 'Please tell us at what time you usually have your second walk or exercise bout of the day?',
  qa26: 'Please tell us at what time you usually have your third walk or exercise bout of the day?',
};

const surveysAnswers = {
  qa1: {
    true: 'Yes',
    false: 'No',
  },
  qa2: {
    true: 'Apple',
    false: 'Android',
  },
  qa3: {
    true: 'Yes',
    false: 'No',
  },
  qa4: {
    true: 'Yes',
    false: 'No',
  },
  qa5: {
    true: 'Yes',
    false: 'No',
  },
  qa6: {
    true: 'Yes',
    false: 'No',
  },
  qa7: {
    true: 'Yes',
    false: 'No',
  },

  qa8: {
    true: 'Yes',
    false: 'No',
  },

  qa9: {
    'opt-1': 'English',
    'opt-2': 'Spanish (coming soon...)',
  },
  qa10: {
    'opt-1': 'Female',
    'opt-2': 'Male',
  },
  qa11: null,
  qa12: null,
  qa13: null,
  qa14: {
    'opt-1': 'Yes',
    'opt-2': 'No',
  },
  qa15: {
    'opt-1': "None",
    'opt-2': "Prediabetes",
    'opt-3': "Diabetes type 1",
    'opt-4': "Diabetes type 2",
    'opt-5': "Other type of diabetes",
  },
  qa16: null,
  qa17: {
    'opt-1': "Regular 8 hours",
    'opt-2': "Regular non 8 hours",
    'opt-3': "Morning",
    'opt-4': "Midday",
    'opt-5': "Evening",
    'opt-6': "Night",
    'opt-7': "Mixed shift",
  },
  qa18: null,
  qa19: null,
  qa20: null,
  qa21: null,
  qa22: null,
  qa23: null,
  qa24: null,
  qa25: null,
  qa26: null,
};

const checkConsentAnswer = (answer) => {
  if (answer) {
    return [{
      question: surveysQuestion['qa8'],
      answer: surveysAnswers['qa8'][answer],
    }];
  }
  return false;
};
const checkIntakeAnswer = (answer) => {
  let answerQUA17;
  if (answer['step-9'] && answer['step-9'].length > 0) {
    answerQUA17 = [];
    answer['step-9'].forEach(item => {
      answerQUA17.push(surveysAnswers['qa17'][item]);
    });
  }
  return [{
    question: surveysQuestion['qa9'],
    answer: surveysAnswers['qa9'][answer['step-1'][0]],
  }, {
    question: surveysQuestion['qa10'],
    answer: surveysAnswers['qa10'][answer['step-2'][0]],
  }, {
    question: surveysQuestion['qa11'],
    answer: moment(answer['step-3']).format('YYYY-MMM-DD'),
  }, {
    question: surveysQuestion['qa12'],
    answer: answer['step-4'],
  }, {
    question: surveysQuestion['qa13'],
    answer: answer['step-5'],
  }, {
    question: surveysQuestion['qa14'],
    answer: (answer['step-6'] && answer['step-6'].length > 0) ? surveysAnswers['qa14'][answer['step-6'][0]] : null,
  }, {
    question: surveysQuestion['qa15'],
    answer: (answer['step-7'] && answer['step-7'].length > 0) ? surveysAnswers['qa15'][answer['step-7'][0]] : null,
  }, {
    question: surveysQuestion['qa16'],
    answer: answer['step-8'],
  }, {
    question: surveysQuestion['qa17'],
    answer: answerQUA17,
  }, {
    question: surveysQuestion['qa18'],
    answer: answer['step-10'],
  }, {
    question: surveysQuestion['qa19'],
    answer: answer['step-11'],
  }, {
    question: surveysQuestion['qa20'],
    answer: answer['step-12'],
  }, {
    question: surveysQuestion['qa21'],
    answer: answer['step-13'],
  }, {
    question: surveysQuestion['qa22'],
    answer: answer['step-14'],
  }, {
    question: surveysQuestion['qa23'],
    answer: answer['step-15'],
  }, {
    question: surveysQuestion['qa24'],
    answer: answer['step-16'],
  }, {
    question: surveysQuestion['qa25'],
    answer: answer['step-17'],
  }, {
    question: surveysQuestion['qa26'],
    answer: answer['step-18'],
  }];
};

const doConsentSurvey = (data) => {
  return new Promise((resolve) => {
    InternationalDiabeteRenussionStudy.showConsentSurvey(data, ok => {
      let result = checkConsentAnswer(ok);
      if (!result) {
        resolve(null);
      } else {
        resolve(result);
      }
    });
  });
};
const doIntakeSurvey = () => {
  return new Promise((resolve) => {
    InternationalDiabeteRenussionStudy.showIntakeSurvey((ok, results) => {
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