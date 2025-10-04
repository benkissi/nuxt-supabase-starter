export const useApi = () => {
    const { $api } = useNuxtApp();

    return apiRepository($api);
};
