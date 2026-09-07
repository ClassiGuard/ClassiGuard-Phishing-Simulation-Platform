import { useState, useEffect } from 'react';
import { axiosInstance } from '../services/axiosInstance'; // Your configured axios instance

export const useResources = () => {
    const [senderProfiles, setSenderProfiles] = useState([]);
    const [telephonyProfiles, setTelephonyProfiles] = useState([]);
    const [audiences, setAudiences] = useState([]);
    const [templates, setTemplates] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchResources = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get('/api/resource/overview');

            if (response.data.success) {
                const { senderProfiles, telephonyProfiles, audiences, templates } = response.data.data;
                setSenderProfiles(senderProfiles);
                setTelephonyProfiles(telephonyProfiles);
                setAudiences(audiences);
                setTemplates(templates);
            } else {
                setError('Failed to fetch resources'); // Handle API failure
            }
        } catch (error) {
            setError(error.message);  // Capture any errors during the API call
        } finally {
            setLoading(false);  // Stop loading when done
        }
    };

    // Automatically fetch resources when the component using this hook mounts
    useEffect(() => {
        fetchResources();
    }, []);

    // Return the resources, loading state, error, and the fetch function for manual re-fetch
    return {
        senderProfiles,
        telephonyProfiles,
        audiences,
        templates,
        loading,
        error,
        fetchResources // This can be used to manually re-fetch if needed
    };
};
