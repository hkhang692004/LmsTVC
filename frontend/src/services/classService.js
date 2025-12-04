import axiosClient from "@/lib/axios";

const classService = {

    getMyClass: () =>{
        return axiosClient.get('/api/classes/me');
    },

};



export default classService;