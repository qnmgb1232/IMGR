import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export const lotteryApi = {
  getHistory: (limit = 20) => api.get(`/lottery/history?limit=${limit}`),
  getLatest: () => api.get('/lottery/latest'),
  getByPeriod: (period: string) => api.get(`/lottery/${period}`),
}

export const predictionApi = {
  getHistory: (limit = 20) => api.get(`/prediction/history?limit=${limit}`),
  getLatest: () => api.get('/prediction/latest'),
  generate: (source = 'manual') => api.post(`/prediction/generate?source=${source}`),
  getLastHitResult: () => api.get('/prediction/last/hit-result'),
}

export const statisticsApi = {
  getHotCold: (periods = 50) => api.get(`/statistics/hot-cold?periods=${periods}`),
  getTrend: (ballType = 'red', limit = 50) =>
    api.get(`/statistics/trend?ball_type=${ballType}&limit=${limit}`),
  getDistribution: (ballType = 'red') =>
    api.get(`/statistics/distribution?ball_type=${ballType}`),
}

export const crawlerApi = {
  fetch: () => api.post('/crawler/fetch'),
}

export const settingsApi = {
  getPredictionHistory: (limit = 50) => api.get(`/settings/history?limit=${limit}`),
  getAvailablePeriods: () => api.get('/settings/periods'),
  getByPeriod: (period: string) => api.get(`/settings/by-period/${period}`),
}
