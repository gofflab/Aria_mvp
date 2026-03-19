import axios from "axios";

const BASE = (import.meta.env.VITE_API_URL ?? "/api") + "/equipment";

export const getEquipmentList = ()                    => axios.get(`${BASE}/`);
export const getEquipment     = (id)                  => axios.get(`${BASE}/${id}`);
export const createEquipment  = (data)                => axios.post(`${BASE}/`, data);
export const updateEquipment  = (id, data)            => axios.patch(`${BASE}/${id}`, data);
export const deleteEquipment  = (id)                  => axios.delete(`${BASE}/${id}`);

export const addSubsystem     = (eqId, data)          => axios.post(`${BASE}/${eqId}/subsystems`, data);
export const updateSubsystem  = (eqId, subId, data)   => axios.patch(`${BASE}/${eqId}/subsystems/${subId}`, data);
export const deleteSubsystem  = (eqId, subId)         => axios.delete(`${BASE}/${eqId}/subsystems/${subId}`);

export const getEquipmentTickets = (eqId)             => axios.get(`${BASE}/${eqId}/tickets`);
