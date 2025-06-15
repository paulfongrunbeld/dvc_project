// Копируем базовые функции и классы из референса
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}

function unpack_resp(response) {
    if (response.status === 204) {
        return null;
    }
    if (response.status === 200 && !response.body) {
        return true;
    }
    if (response.status === 204 || !response.body) {
        return null; // Возвращаем null для пустых ответов
    }
    return response.json();
}

function unpackString_resp(response) {
    if (response.status === 204) {
        return null;
    }
    if (response.status === 200 && !response.body) {
        return true;
    }
    return response.text();
}

class Caller {
    constructor(base_url, cookies) {
        this._base = base_url;
        this._cookies = cookies;
    }

    async fetch(addr, options) {
        const response = await fetchWithTimeout(`${this._base}${addr}`, {
            ...this._cookies,
            ...options,
        });
        return unpack_resp(response);
    }

    async jpost(addr, body, time = 8000) {
        const response = await fetchWithTimeout(`${this._base}${addr}`, {
            timeout: time,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
            ...this._cookies
        });
        return unpack_resp(response);
    }

    async postWithoutHeaders(addr, body, time = 10000) {
        const response = await fetchWithTimeout(`${this._base}${addr}`, {
            method: 'POST',
            body: body,
            timeout: time,
            ...this._cookies
        });
        return unpack_resp(response);
    }
}

// Реализация контроллеров
class ImageAPI extends Caller {
    constructor(base_url, cookies) {
        super(base_url, cookies);
    }

    async uploadImage(file, projectId) {
        const formData = new FormData();
        formData.append('file', file);

        return this.fetch(`/api/ImagesController/upload?projectId=${projectId}`, {
            method: 'POST',
            body: formData
        });
    }

    async fetchImages(page, pageSize = 10) {
        return this.fetch(`/api/ImagesController/getimages?page=${page}&pageSize=${pageSize}`);
    }

    async saveMarkup(imageHash, markupJson, markupDescriptionUuid, learningImage) {
        return this.jpost('/api/ImagesController/markup', {
          ImageHash: imageHash,
          MarkupJson: markupJson,
          MarkupDescriptionUuid: markupDescriptionUuid,
          LearningImage: learningImage // Новое поле
        });
      }

    async getMarkups(imageUuid) {
        return this.fetch(`/api/ImagesController/markuplist/${imageUuid}`);
    }
}

class MarkupDescriptionAPI extends Caller {
    constructor(base_url, cookies) {
        super(base_url, cookies);
    }

    async getAllMarkupDescriptions() {
        return this.fetch('/api/MarkupDescriptions/GetAll');
    }

    async getMarkupDescriptionsByProject(projectUuid) {
        return this.fetch(`/api/MarkupDescriptions/getbyproject/${projectUuid}`);
    }

    async getMarkupDescriptionByUuid(uuid) {
        return this.fetch(`/api/MarkupDescriptions/getbyid/${uuid}`);
    }

    async createEmptyMarkupDescription(projectUuid) {
        return this.fetch(`/api/MarkupDescriptions/create/${projectUuid}`);
    }

    async updateMarkupDescription(uuid, updatedMarkupDescription) {
        return this.fetch(`/api/MarkupDescriptions/update/${uuid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedMarkupDescription)
        });
    }

    async removeMarkupDescription(uuid) {
        return this.fetch(`/api/MarkupDescriptions/remove/${uuid}`, {
            method: 'PUT'
        });
    }
    
}

class ProjectAPI extends Caller {
    constructor(base_url, cookies) {
        super(base_url, cookies);
    }

    async getAllProjects() {
        return this.fetch('/api/Projects/GetAll', { timeout: 15000 });
    }

    async getProjectByUuid(uuid) {
        return this.fetch(`/api/Projects/getbyid/${uuid}`);
    }

    async createEmptyProject() {
        return this.fetch('/api/Projects/create');
    }

    async updateProject(uuid, updatedProject) {
        return this.fetch(`/api/Projects/update/${uuid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProject)
        });
    }
}

// Расширяем основной API класс
export class API extends Caller {
    constructor(base_url, cookies) {
        super(base_url, cookies);

        this.image = new ImageAPI(base_url, cookies);
        this.markupDescription = new MarkupDescriptionAPI(base_url, cookies);
        this.project = new ProjectAPI(base_url, cookies);
    }
}