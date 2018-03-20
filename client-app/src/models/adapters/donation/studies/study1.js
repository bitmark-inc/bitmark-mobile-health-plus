import {
  NativeModules,
} from 'react-native';
import { merge } from 'lodash';

import appleHealthKit from './../apple-health-kit';
import studyCommonUtil from './common';

const WomenHealthStudy = NativeModules.WomenHealthStudy;

const surveysQuestion = {
  qa1: 'What is your biological sex?',
  qa2: 'Are you currently pregnant?',
  qa3: 'Are you age 18 or older?',
  qa4: 'Are you willing to download an app to track your reproductive health?',
  qa5: 'Are you willing to share your reproductive and behavioral health data through HealthKit?',
  qa6: 'Are you currently a student from UC Berkeley?',

  qa7: 'Do you agree with consent?',

  qa8: 'Please specify your race. Select all that apply',
  qa9: 'Please specify your ethnicity.',
  qa10: 'What is your current age?',
  qa11: 'What is your marital status?',
  qa12: 'What is the highest degree or level of school you have completed?',
  qa13: 'What is your total household income?',
  qa14: 'On average, how many hours do you sleep per night?',
  qa15: 'On average, how many hours do you exercise per day?',
  qa16: 'What is your height?',
  qa17: 'What is your current weight?',

};

const surveysAnswers = {
  qa1: {
    true: 'Male',
    false: 'Female',
  },
  qa2: {
    true: 'Yes',
    false: 'No',
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
    'opt-1': 'American Indian or Alaska Native',
    'opt-2': 'Asian',
    'opt-3': 'Black or African American',
    'opt-4': 'Native Hawaiian or Other Pacific Islander',
    'opt-5': 'White',
  },
  qa9: {
    'opt-1': 'Hispanic or Latino',
    'opt-2': 'Not Hispanic or Latino',
  },
  qa10: null,
  qa11: {
    'opt-1': 'Married',
    'opt-2': 'Widowed',
    'opt-3': 'Divorced',
    'opt-4': 'Separated',
    'opt-5': 'Never married',
  },
  qa12: {
    'opt-1': "No schooling completed",
    'opt-2': "Nursery school to 8th grade",
    'opt-3': "9th, 10th or 11th grade",
    'opt-4': "12th grade, no diploma",
    'opt-5': "High school graduate - high school diploma or the equivalent (for example: GED)",
    'opt-6': "Some college credit, but less than 1 year",
    'opt-7': "1 or more years of college, no degree",
    'opt-8': "Associate degree (for example: AA, AS)",
    'opt-9': "Bachelor's degree (for example: BA, AB, BS)",
    'opt-10': "Master's degree (for example: MA, MS, MEng, MEd, MSW, MBA)",
    'opt-11': "Professional degree (for example: MD, DDS, DVM, LLB, JD)",
    'opt-12': "Doctorate degree (for example: PhD, EdD)",
  },
  qa13: {
    'opt-1': "Less than $10,000",
    'opt-2': "$10,000 to $19,999",
    'opt-3': "$20,000 to $29,999",
    'opt-4': "$30,000 to $39,999",
    'opt-5': "$40,000 to $49,999",
    'opt-6': "$50,000 to $59,999",
    'opt-7': "$60,000 to $69,999",
    'opt-8': "$70,000 to $79,999",
    'opt-9': "$80,000 to $89,999",
    'opt-10': "$90,000 to $99,999",
    'opt-11': "$100,000 to $149,999",
    'opt-12': "$150,000 or more",
  },
  qa14: null,
  qa15: null,
  qa16: null,
  qa17: null,
};

let checkConsentAnswer = (answer) => {
  if (answer) {
    return [{
      question: surveysQuestion['qa7'],
      answer: surveysAnswers['qa7'][answer],
    }];
  }
  return false;
};

let checkIntakeAnswer = (answer) => {
  if (answer &&
    answer['step-1'] &&
    answer['step-2'] && surveysAnswers['qa9'][answer['step-2'][0]] &&
    answer['step-4'] && surveysAnswers['qa11'][answer['step-4'][0]] &&
    answer['step-5'] && surveysAnswers['qa12'][answer['step-5'][0]] &&
    answer['step-6'] && surveysAnswers['qa13'][answer['step-6'][0]] &&
    answer['step-3'] && answer['step-7'] && answer['step-8'] && answer['step-9'] && answer['step-10']) {
    let answerQUA8 = [];
    answer['step-1'].forEach(item => {
      answerQUA8.push(surveysAnswers['qa8'][item]);
    });
    return [{
      question: surveysQuestion['qa8'],
      answer: answerQUA8,
    }, {
      question: surveysQuestion['qa9'],
      answer: surveysAnswers['qa9'][answer['step-2'][0]],
    }, {
      question: surveysQuestion['qa10'],
      answer: answer['step-3'],
    }, {
      question: surveysQuestion['qa11'],
      answer: surveysAnswers['qa11'][answer['step-4'][0]],
    }, {
      question: surveysQuestion['qa12'],
      answer: surveysAnswers['qa12'][answer['step-5'][0]],
    }, {
      question: surveysQuestion['qa13'],
      answer: surveysAnswers['qa13'][answer['step-6'][0]],
    }, {
      question: surveysQuestion['qa14'],
      answer: answer['step-7'],
    }, {
      question: surveysQuestion['qa15'],
      answer: answer['step-8'],
    }, {
      question: surveysQuestion['qa16'],
      answer: answer['step-9'],
    }, {
      question: surveysQuestion['qa17'],
      answer: answer['step-10'],
    }];
  }
  return false;
};

let doConsentSurvey = (data) => {
  return new Promise((resolve, reject) => {
    WomenHealthStudy.showConsentSurvey(data, ok => {
      let result = checkConsentAnswer(ok);
      if (!result) {
        reject(new Error('Cancel'));
      } else {
        resolve(result);
      }
    });
  });
};

let doIntakeSurvey = () => {
  return new Promise((resolve, reject) => {
    WomenHealthStudy.showIntakeSurvey((ok, results) => {
      if (ok && results) {
        resolve(checkIntakeAnswer(results));
      } else {
        reject(new Error('Cancel'));
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
    appleHealthKit.initHealthKit(studyInformation.dataTypes).then(() => {
      let promiseList = [];
      studyInformation.dataTypes.forEach((type) => {
        promiseList.push(appleHealthKit['get' + type](options));
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
  getHealthKitData: getHealthKitData,
}) 