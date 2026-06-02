class SupabaseDataset {
  constructor(dataArray) {
    this.items = dataArray || [];
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

class SupabaseMenuRepository {
  constructor(apiKey) {
    this.apiKey = apiKey.trim();

    const dbScript = document.getElementById('supabase-db');

    this.sqlQuery =
      dbScript && dbScript.dataset.sql
        ? dbScript.dataset.sql
        : 'select=item,url';
  }

  async fetchData(path) {
  //  const apiUrl = 'https://hpnnrlshfxxcyujrxegka.supabase.co' + path;
    const apiUrl = 'https://hpnrlshfxxcyujrxegka.supabase.co' + path;
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          apikey: this.apiKey,
          Authorization: 'Bearer ' + this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Σφάλμα API: ${response.status}`);
      }

      const rawData = await response.json();

      return new SupabaseDataset(rawData);

    } catch (error) {
      console.error('Αποτυχία ανάκτησης δεδομένων:', error);
      return new SupabaseDataset([]);
    }
  }

  async fetchMenuData(tableName) {
    return this.fetchData(tableName + '?' + this.sqlQuery);
  }

  async fetchMembers() {
    return this.fetchData(
      '/rest/v1/members?select=id,first_name,last_name,email,phone,address,cv_link,media_link,photo_link&order=last_name.asc'
    );
  }
}