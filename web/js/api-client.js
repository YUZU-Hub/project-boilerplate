/**
 * PocketBase API Client Wrapper
 *
 * Usage:
 *   import { api } from './js/api-client.js';
 *   const items = await api.list('collection_name');
 */

// Configure your API URL
const API_URL = window.API_URL || 'http://localhost:8090';

// Initialize PocketBase (requires SDK loaded via CDN or npm)
const pb = new PocketBase(API_URL);

export const api = {
    /**
     * Get PocketBase instance for direct access
     */
    client: pb,

    /**
     * Check API health
     */
    async health() {
        const response = await fetch(`${API_URL}/api/health`);
        return response.ok;
    },

    /**
     * List records from a collection
     */
    async list(collection, page = 1, perPage = 20, options = {}) {
        return pb.collection(collection).getList(page, perPage, options);
    },

    /**
     * Get a single record by ID
     */
    async get(collection, id, options = {}) {
        return pb.collection(collection).getOne(id, options);
    },

    /**
     * Create a new record
     */
    async create(collection, data) {
        return pb.collection(collection).create(data);
    },

    /**
     * Update a record
     */
    async update(collection, id, data) {
        return pb.collection(collection).update(id, data);
    },

    /**
     * Delete a record
     */
    async delete(collection, id) {
        return pb.collection(collection).delete(id);
    },

    /**
     * Authentication: Login with email/password
     */
    async login(email, password) {
        return pb.collection('users').authWithPassword(email, password);
    },

    /**
     * Authentication: Register new user
     */
    async register(email, password, passwordConfirm, data = {}) {
        return pb.collection('users').create({
            email,
            password,
            passwordConfirm,
            ...data
        });
    },

    /**
     * Authentication: Logout
     */
    logout() {
        pb.authStore.clear();
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return pb.authStore.isValid;
    },

    /**
     * Get current user
     */
    currentUser() {
        return pb.authStore.model;
    },

    /**
     * Subscribe to realtime changes
     */
    subscribe(collection, callback, filter = '*') {
        return pb.collection(collection).subscribe(filter, callback);
    },

    /**
     * Unsubscribe from realtime changes
     */
    unsubscribe(collection) {
        return pb.collection(collection).unsubscribe();
    }
};

export default api;
