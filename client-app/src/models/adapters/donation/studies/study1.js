import {
  NativeModules,
} from 'react-native';
import { merge } from 'lodash';

import { AppleHealthKitModel } from './../apple-health-kit-model';
import studyCommonUtil from './common';

const WomenHealthStudy = NativeModules.WomenHealthStudy;

let IntakeSurvey = {
  questions: {
    qa1: 'Please specify your race. Select all that apply',
    qa2: 'Please specify your ethnicity.',
    qa3: 'What is your current age?',
    qa4: 'What is your marital status?',
    qa5: 'What is the highest degree or level of school you have completed?',
    qa6: 'On average, how many hours do you sleep per night?',
    qa7: 'On average, how many hours do you exercise per day?',
    qa8: 'What is your height?',
    qa9: 'What is your current weight?',
  },
  answers: {
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
    qa6: null,
    qa7: null,
    qa8: null,
    qa9: null,
  }
}

let checkIntakeAnswers = (answer) => {
  console.log('checkIntakeAnswers : ', answer);
  if (answer &&
    answer['step-1'] &&
    answer['step-2'] && IntakeSurvey.answers['qa2'][answer['step-2'][0]] &&
    answer['step-4'] && IntakeSurvey.answers['qa4'][answer['step-4'][0]] &&
    answer['step-5'] && IntakeSurvey.answers['qa5'][answer['step-5'][0]] &&
    answer['step-3'] && answer['step-6'] && answer['step-7'] && answer['step-8'] && answer['step-9']) {
    let answerQUA8 = [];
    answer['step-1'].forEach(item => {
      answerQUA8.push(IntakeSurvey.answers['qa1'][item]);
    });
    return [{
      question: IntakeSurvey.questions['qa1'],
      answer: answerQUA8,
    }, {
      question: IntakeSurvey.questions['qa2'],
      answer: IntakeSurvey.answers['qa2'][answer['step-2'][0]],
    }, {
      question: IntakeSurvey.questions['qa3'],
      answer: answer['step-3'],
    }, {
      question: IntakeSurvey.questions['qa4'],
      answer: IntakeSurvey.answers['qa4'][answer['step-4'][0]],
    }, {
      question: IntakeSurvey.questions['qa5'],
      answer: IntakeSurvey.answers['qa5'][answer['step-5'][0]],
    }, {
      question: IntakeSurvey.questions['qa6'],
      answer: answer['step-6'],
    }, {
      question: IntakeSurvey.questions['qa7'],
      answer: answer['step-7'],
    }, {
      question: IntakeSurvey.questions['qa8'],
      answer: answer['step-8'],
    }, {
      question: IntakeSurvey.questions['qa9'],
      answer: answer['step-9'],
    }];
  }
  return false;
};

let ExitSurvey = {
  questions: {
    qa1: '1. I think that I would like to use this system frequently.',
    qa2: '2. I found the system unnecessarily complex.',
    qa3: '3. I thought the system was easy to use.',
    qa4: '4. I think that I would need the support of a technical person to be able to use this system.',
    qa5: '5. I found the various functions in this system were well integrated.',
    qa6: '6. I thought there was too much inconsistency in this system.',
    qa7: '7. I would imagine that most people would learn to use this system very quickly.',
    qa8: '8. I found the system very cumbersome to use.',
    qa9: '9. I felt very confident using the system.',
    qa10: '10. I needed to learn a lot of things before I could get going with this system.',

  }
};

let checkExitSurveyAnswers = (answers) => {
  if (answers) {
    return [{
      question: ExitSurvey.questions['qa1'],
      answer: answers['step-1'],
    }, {
      question: ExitSurvey.questions['qa2'],
      answer: answers['step-2'],
    }, {
      question: ExitSurvey.questions['qa3'],
      answer: answers['step-3'],
    }, {
      question: ExitSurvey.questions['qa4'],
      answer: answers['step-4'],
    }, {
      question: ExitSurvey.questions['qa5'],
      answer: answers['step-5'],
    }, {
      question: ExitSurvey.questions['qa6'],
      answer: answers['step-6'],
    }, {
      question: ExitSurvey.questions['qa7'],
      answer: answers['step-7'],
    }, {
      question: ExitSurvey.questions['qa8'],
      answer: answers['step-8'],
    }, {
      question: ExitSurvey.questions['qa9'],
      answer: answers['step-9'],
    }, {
      question: ExitSurvey.questions['qa10'],
      answer: answers['step-10'],
    }];
  }
  return false;
}

let doConsentSurvey = (data) => {
  return new Promise((resolve) => {
    WomenHealthStudy.showConsentSurvey(data, resolve);
  });
};

let doIntakeSurvey = () => {
  return new Promise((resolve) => {
    WomenHealthStudy.showIntakeSurvey((ok, results) => {
      if (ok && results) {
        resolve(checkIntakeAnswers(results));
      } else {
        resolve(null);
      }
    });
  });
};

let doExitSurvey1 = () => {
  return new Promise((resolve) => {
    WomenHealthStudy.showExitSurvey1((ok, results) => {
      console.log('showExitSurvey1 : result ', ok, results);
      if (ok && results) {
        resolve(checkExitSurveyAnswers(results));
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
  doConsentSurvey,
  doIntakeSurvey,
  getHealthKitData,
  doExitSurvey1,
}) 