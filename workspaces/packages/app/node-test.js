const os = require('os')
const { is, getPath, getPlatform } = require('./dist/dreamapp.min')

console.log(is)

console.log({
  cwd: getPath('cwd'),
  home: getPath('home'),
  temp: getPath('temp'),
  appData: getPath('appData'),
  userData: getPath('userData'),
  cache: getPath('cache'),
  documents: getPath('documents'),
  desktop: getPath('desktop'),
  downloads: getPath('downloads'),
  music: getPath('music'),
  pictures: getPath('pictures'),
  videos: getPath('videos'),
  savegames: getPath('savegames'),
})
