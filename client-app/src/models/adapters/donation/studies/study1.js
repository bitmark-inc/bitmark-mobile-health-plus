import {
  NativeModules,
} from 'react-native';
import { merge } from 'lodash';

import { AppleHealthKitModel } from './../apple-health-kit-model';
import studyCommonUtil from './common';

const WomenHealthStudy = NativeModules.WomenHealthStudy;

const surveysQuestion = {
  qa1: 'Please specify your race. Select all that apply',
  qa2: 'Please specify your ethnicity.',
  qa3: 'What is your current age?',
  qa4: 'What is your marital status?',
  qa5: 'What is the highest degree or level of school you have completed?',
  qa6: 'What is your total household income?',
  qa7: 'On average, how many hours do you sleep per night?',
  qa8: 'On average, how many hours do you exercise per day?',
  qa9: 'What is your height?',
  qa10: 'What is your current weight?',

};

const surveysAnswers = {
  qa1: {
    'opt-1': 'American Indian or Alaska Native',
    'opt-2': 'Asian',
    'opt-3': 'Black or African American',
    'opt-4': 'Native Hawaiian or Other Pacific Islander',
    'opt-5': 'White',
  },
  qa2: {
    'opt-1': 'Hispanic or Latino',
    'opt-2': 'Not Hispanic or Latino',
  },
  qa3: null,
  qa4: {
    'opt-1': 'Married',
    'opt-2': 'Widowed',
    'opt-3': 'Divorced',
    'opt-4': 'Separated',
    'opt-5': 'Never married',
  },
  qa5: {
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
  qa6: {
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
  qa7: null,
  qa8: null,
  qa9: null,
  qa10: null,
};


let checkIntakeAnswer = (answer) => {
  if (answer &&
    answer['step-1'] &&
    answer['step-2'] && surveysAnswers['qa2'][answer['step-2'][0]] &&
    answer['step-4'] && surveysAnswers['qa4'][answer['step-4'][0]] &&
    answer['step-5'] && surveysAnswers['qa5'][answer['step-5'][0]] &&
    answer['step-6'] && surveysAnswers['qa6'][answer['step-6'][0]] &&
    answer['step-3'] && answer['step-7'] && answer['step-8'] && answer['step-9'] && answer['step-10']) {
    let answerQUA8 = [];
    answer['step-1'].forEach(item => {
      answerQUA8.push(surveysAnswers['qa1'][item]);
    });
    return [{
      question: surveysQuestion['qa1'],
      answer: answerQUA8,
    }, {
      question: surveysQuestion['qa2'],
      answer: surveysAnswers['qa2'][answer['step-2'][0]],
    }, {
      question: surveysQuestion['qa3'],
      answer: answer['step-3'],
    }, {
      question: surveysQuestion['qa4'],
      answer: surveysAnswers['qa4'][answer['step-4'][0]],
    }, {
      question: surveysQuestion['qa5'],
      answer: surveysAnswers['qa5'][answer['step-5'][0]],
    }, {
      question: surveysQuestion['qa6'],
      answer: surveysAnswers['qa6'][answer['step-6'][0]],
    }, {
      question: surveysQuestion['qa7'],
      answer: answer['step-7'],
    }, {
      question: surveysQuestion['qa8'],
      answer: answer['step-8'],
    }, {
      question: surveysQuestion['qa9'],
      answer: answer['step-9'],
    }, {
      question: surveysQuestion['qa10'],
      answer: answer['step-10'],
    }];
  }
  return false;
};

let doConsentSurvey = (data) => {
  return new Promise((resolve) => {
    WomenHealthStudy.showConsentSurvey(data, resolve);
  });
};

let doIntakeSurvey = () => {
  return new Promise((resolve) => {
    WomenHealthStudy.showIntakeSurvey((ok, results) => {
      if (ok && results) {
        resolve(checkIntakeAnswer(results));
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
  getHealthKitData: getHealthKitData,
}) 