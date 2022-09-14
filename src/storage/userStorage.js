const userStorage = {};

const timeOut = {};

const addUserInfoInServerStorage = (key, value) => {
  userStorage[key] = value;

  timeOut[key] = setTimeout(() => {
    delete userStorage[key];
  }, 186000);
};

const removeUserInfoFromServerStorage = (key) => {
  clearTimeout(timeOut[key]);
  if (userStorage[key]) delete userStorage[key];
};

const getUserInfoFromServerStorage = (key) => {
  return userStorage[key];
};

module.exports = {
  addUserInfoInServerStorage,
  removeUserInfoFromServerStorage,
  getUserInfoFromServerStorage,
};
