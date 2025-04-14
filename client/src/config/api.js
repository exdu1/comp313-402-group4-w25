const apiConfig = {
  baseURL: '/api',
  endpoints: {
    pullHistoryByUser: '/pullHistoryByUser',
    pullHistoryById: (id) => `/pullHistoryById/${id}`,
    activeListener: '/active-listener',
    saveToHistory: '/saveToHistory',
    signin: '/signin',
    signup: '/signup'
  }
};

export default apiConfig;