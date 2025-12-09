import axiosClient from "@/lib/axios";

const classService = {

    getMyClass: () =>{
        return axiosClient.get('/api/classes/me');
    },
    getClassById:(id) =>{
        return axiosClient.get(`/api/classes/${id}`);
    },

};



export default classService;