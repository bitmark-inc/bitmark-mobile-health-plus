let cacheData = {
  donationTasks: {
    totalTasks: 0,
    totalDonationTasks: 0,
    donationTasks: [],
  },

  timelinesData: {
    timelines: [],
    totalTimelines: 0,
    remainTimelines: 0,
  }
};

let resetCacheData = () => {
  cacheData = {
    donationTasks: {
      totalTasks: 0,
      totalDonationTasks: 0,
      donationTasks: [],
    },
    timelinesData: {
      timelines: [],
      totalTimelines: 0,
      remainTimelines: 0,
    }
  };
  return cacheData;
};


const getDonationTasks = () => {
  return cacheData.donationTasks;
};

const setDonationTasks = ({ totalTasks, totalDonationTasks, donationTasks }) => {
  cacheData.donationTasks.totalTasks = (totalTasks != undefined) ? totalTasks : cacheData.donationTasks.totalTasks;
  cacheData.donationTasks.totalDonationTasks = (totalDonationTasks != undefined) ? totalDonationTasks : cacheData.donationTasks.totalDonationTasks;
  cacheData.donationTasks.donationTasks = donationTasks ? donationTasks : cacheData.donationTasks.donationTasks;
};


const getTimelines = () => {
  return cacheData.timelinesData;
};

const setTimelines = ({ timelines, totalTimelines, remainTimelines }) => {
  cacheData.timelinesData.remainTimelines = (remainTimelines != undefined) ? remainTimelines : cacheData.timelinesData.remainTimelines;
  cacheData.timelinesData.totalTimelines = (totalTimelines != undefined) ? totalTimelines : cacheData.timelinesData.totalTimelines;
  cacheData.timelinesData.timelines = timelines ? timelines : cacheData.timelinesData.timelines;
};


const DataCacheProcessor = {
  resetCacheData,

  getDonationTasks,
  setDonationTasks,

  getTimelines,
  setTimelines,

  cacheLength: 20,
};

export { DataCacheProcessor };