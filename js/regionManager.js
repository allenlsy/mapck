/**
 * Region Manager Module
 * Handles loading and managing region data
 */

class RegionManager {
    constructor() {
        this.regions = null;
        this.currentRegion = null;
    }

    /**
     * Load regions data from JSON file
     */
    async loadRegions() {
        try {
            const response = await fetch('../data/regions.json');
            const data = await response.json();
            this.regions = data.regions;
            return this.regions;
        } catch (error) {
            console.error('Failed to load regions:', error);
            throw new Error('Failed to load region data');
        }
    }

    /**
     * Get all available regions
     */
    getRegions() {
        return this.regions ? Object.values(this.regions) : [];
    }

    /**
     * Get region by ID
     */
    getRegion(regionId) {
        return this.regions ? this.regions[regionId] : null;
    }

    /**
     * Set current region
     */
    setCurrentRegion(regionId) {
        this.currentRegion = this.getRegion(regionId);
        return this.currentRegion;
    }

    /**
     * Get current region
     */
    getCurrentRegion() {
        return this.currentRegion;
    }

    /**
     * Get countries for current region
     */
    getCountries() {
        return this.currentRegion ? this.currentRegion.countries : [];
    }

    /**
     * Get country by ID
     */
    getCountry(countryId) {
        const countries = this.getCountries();
        return countries.find(c => c.id === countryId);
    }

    /**
     * Get map image URL for current region
     */
    getMapImageUrl() {
        return this.currentRegion ? `../${this.currentRegion.mapImage}` : null;
    }
}

export default RegionManager;
