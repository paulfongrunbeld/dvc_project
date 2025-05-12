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
  
    async saveMarkup(imageHash, markupJson, markupDescriptionUuid) {
      return this.jpost('/api/ImagesController/markup', {
        ImageHash: imageHash,
        MarkupJson: markupJson,
        MarkupDescriptionUuid: markupDescriptionUuid
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
      return this.fetch('/api/MarkupDescriptionsController/GetAll');
    }
  
    async getMarkupDescriptionsByProject(projectUuid) {
      return this.fetch(`/api/MarkupDescriptionsController/getbyproject/${projectUuid}`);
    }
  
    async getMarkupDescriptionByUuid(uuid) {
      return this.fetch(`/api/MarkupDescriptionsController/getbyid/${uuid}`);
    }
  
    async createEmptyMarkupDescription(projectUuid) {
      return this.fetch(`/api/MarkupDescriptionsController/create/${projectUuid}`);
    }
  
    async updateMarkupDescription(uuid, updatedMarkupDescription) {
      return this.fetch(`/api/MarkupDescriptionsController/update/${uuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedMarkupDescription)
      });
    }
  }
  
  class ProjectAPI extends Caller {
    constructor(base_url, cookies) {
      super(base_url, cookies);
    }
  
    async getAllProjects() {
      return this.fetch('/api/ProjectsController/GetAll');
    }
  
    async getProjectByUuid(uuid) {
      return this.fetch(`/api/ProjectsController/getbyid/${uuid}`);
    }
  
    async createEmptyProject() {
      return this.fetch('/api/ProjectsController/create');
    }
  
    async updateProject(uuid, updatedProject) {
      return this.fetch(`/api/ProjectsController/update/${uuid}`, {
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
      // ... существующие инстансы ...
      
      // Добавляем новые модули
      this.image = new ImageAPI(base_url, cookies);
      this.markupDescription = new MarkupDescriptionAPI(base_url, cookies);
      this.project = new ProjectAPI(base_url, cookies);
    }
  }