import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RepositoryResource {
  id: string;
  title: string;
  description: string;
  fileType: 'pdf' | 'video' | 'image' | 'document' | 'link' | 'other';
  category: string;
  tags: string[];
  fileSize?: number;
  uploadDate: Date;
  uploader: string;
  downloadCount: number;
  viewCount: number;
  fileUrl?: string;
  isPublic: boolean;
}

@Component({
  selector: 'app-repository',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss']
})
export class RepositoryComponent implements OnInit {
  resources: RepositoryResource[] = [
    {
      id: 'RES-001',
      title: 'Guía de Programación Avanzada',
      description: 'Material completo sobre patrones de diseño y arquitectura de software',
      fileType: 'pdf',
      category: 'Programación',
      tags: ['patrones', 'arquitectura', 'java', 'programación'],
      fileSize: 2.5,
      uploadDate: new Date('2024-01-10'),
      uploader: 'Dr. Carlos Mendoza',
      downloadCount: 45,
      viewCount: 120,
      isPublic: true
    },
    {
      id: 'RES-002',
      title: 'Video: Introducción a Base de Datos',
      description: 'Video tutorial sobre normalización y diseño de bases de datos',
      fileType: 'video',
      category: 'Base de Datos',
      tags: ['sql', 'normalización', 'tutorial', 'bases de datos'],
      fileSize: 15.8,
      uploadDate: new Date('2024-01-08'),
      uploader: 'Dra. Ana López',
      downloadCount: 78,
      viewCount: 210,
      isPublic: true
    },
    {
      id: 'RES-003',
      title: 'Presentación: Redes Neuronales',
      description: 'Diapositivas sobre fundamentos de machine learning y deep learning',
      fileType: 'document',
      category: 'Inteligencia Artificial',
      tags: ['machine learning', 'deep learning', 'redes neuronales', 'python'],
      fileSize: 8.2,
      uploadDate: new Date('2024-01-05'),
      uploader: 'Dr. Roberto Silva',
      downloadCount: 32,
      viewCount: 95,
      isPublic: false
    },
    {
      id: 'RES-004',
      title: 'Ejercicios de Matemáticas Discretas',
      description: 'Colección de problemas resueltos de lógica matemática',
      fileType: 'pdf',
      category: 'Matemáticas',
      tags: ['lógica', 'ejercicios', 'matemáticas discretas', 'problemas'],
      fileSize: 1.8,
      uploadDate: new Date('2024-01-12'),
      uploader: 'Dra. María González',
      downloadCount: 67,
      viewCount: 150,
      isPublic: true
    }
  ];

  searchQuery: string = '';
  searchTags: string[] = [];
  currentTagInput: string = '';
  
  selectedCategories: string[] = [];
  selectedFileTypes: string[] = [];
  selectedVisibility: string = 'all';
  dateRange: { start: Date | null; end: Date | null } = { start: null, end: null };
  
  sortBy: string = 'uploadDate';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  showFilters: boolean = false;
  showSearchModal: boolean = false;
  
  filteredResources: RepositoryResource[] = [];
  
  showUploadModal: boolean = false;
  isUploading: boolean = false;
  uploadProgress: number = 0;
  selectedFiles: File[] = [];
  
  newResource: Partial<RepositoryResource> = {
    title: '',
    description: '',
    fileType: 'document',
    category: '',
    tags: [],
    isPublic: true
  };

  categories: string[] = [
    'Programación',
    'Base de Datos',
    'Redes',
    'Matemáticas',
    'Inteligencia Artificial',
    'Investigación',
    'Tesis',
    'Exámenes',
    'Material de Clase'
  ];

  fileTypes = [
    { value: 'pdf', label: 'PDF', icon: 'bi-file-earmark-pdf' },
    { value: 'video', label: 'Video', icon: 'bi-play-btn' },
    { value: 'image', label: 'Imagen', icon: 'bi-image' },
    { value: 'document', label: 'Documento', icon: 'bi-file-earmark-word' },
    { value: 'link', label: 'Enlace', icon: 'bi-link' },
    { value: 'other', label: 'Otro', icon: 'bi-file-earmark' }
  ];

  sortOptions = [
    { value: 'uploadDate', label: 'Fecha de subida', icon: 'bi-calendar' },
    { value: 'title', label: 'Título', icon: 'bi-sort-alpha-down' },
    { value: 'downloadCount', label: 'Popularidad', icon: 'bi-download' },
    { value: 'viewCount', label: 'Visualizaciones', icon: 'bi-eye' },
    { value: 'fileSize', label: 'Tamaño', icon: 'bi-hdd' }
  ];

  ngOnInit() {
    this.applyFilters();
  }

  applyFilters() {
    let results = [...this.resources];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      results = results.filter(resource =>
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (this.searchTags.length > 0) {
      results = results.filter(resource =>
        this.searchTags.every(tag => 
          resource.tags.some(resourceTag => 
            resourceTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    if (this.selectedCategories.length > 0) {
      results = results.filter(resource => 
        this.selectedCategories.includes(resource.category)
      );
    }

    if (this.selectedFileTypes.length > 0) {
      results = results.filter(resource => 
        this.selectedFileTypes.includes(resource.fileType)
      );
    }

    if (this.selectedVisibility !== 'all') {
      const isPublic = this.selectedVisibility === 'public';
      results = results.filter(resource => resource.isPublic === isPublic);
    }

    if (this.dateRange.start) {
      results = results.filter(resource => 
        new Date(resource.uploadDate) >= new Date(this.dateRange.start!)
      );
    }
    if (this.dateRange.end) {
      results = results.filter(resource => 
        new Date(resource.uploadDate) <= new Date(this.dateRange.end!)
      );
    }

    results = this.sortResources(results);

    this.filteredResources = results;
  }

  sortResources(resources: RepositoryResource[]): RepositoryResource[] {
    return resources.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'downloadCount':
          aValue = a.downloadCount;
          bValue = b.downloadCount;
          break;
        case 'viewCount':
          aValue = a.viewCount;
          bValue = b.viewCount;
          break;
        case 'fileSize':
          aValue = a.fileSize || 0;
          bValue = b.fileSize || 0;
          break;
        case 'uploadDate':
        default:
          aValue = new Date(a.uploadDate);
          bValue = new Date(b.uploadDate);
      }

      if (this.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  addSearchTag() {
    const tag = this.currentTagInput.trim().toLowerCase();
    if (tag && !this.searchTags.includes(tag)) {
      this.searchTags.push(tag);
      this.currentTagInput = '';
      this.applyFilters();
    }
  }

  removeSearchTag(tag: string) {
    this.searchTags = this.searchTags.filter(t => t !== tag);
    this.applyFilters();
  }

  clearSearchTags() {
    this.searchTags = [];
    this.applyFilters();
  }

  toggleCategory(category: string) {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
    this.applyFilters();
  }

  toggleFileType(fileType: string) {
    const index = this.selectedFileTypes.indexOf(fileType);
    if (index > -1) {
      this.selectedFileTypes.splice(index, 1);
    } else {
      this.selectedFileTypes.push(fileType);
    }
    this.applyFilters();
  }

  changeSort(sortBy: string) {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'desc';
    }
    this.applyFilters();
  }

  clearAllFilters() {
    this.searchQuery = '';
    this.searchTags = [];
    this.selectedCategories = [];
    this.selectedFileTypes = [];
    this.selectedVisibility = 'all';
    this.dateRange = { start: null, end: null };
    this.sortBy = 'uploadDate';
    this.sortOrder = 'desc';
    this.applyFilters();
  }

  getAllTags(): string[] {
    const allTags = this.resources.flatMap(resource => resource.tags);
    return [...new Set(allTags)].sort();
  }

  getSuggestedTags(): string[] {
    if (!this.currentTagInput.trim()) {
      return this.getAllTags().slice(0, 5);
    }
    
    const input = this.currentTagInput.toLowerCase();
    return this.getAllTags()
      .filter(tag => tag.toLowerCase().includes(input) && !this.searchTags.includes(tag))
      .slice(0, 5);
  }

  getTotalDownloads(): number {
    return this.resources.reduce((total, resource) => total + resource.downloadCount, 0);
  }

  getTotalViews(): number {
    return this.resources.reduce((total, resource) => total + resource.viewCount, 0);
  }

  getPublicResourcesCount(): number {
    return this.resources.filter(resource => resource.isPublic).length;
  }

  openUploadModal() {
    this.showUploadModal = true;
    this.resetUploadForm();
  }

  resetUploadForm() {
    this.newResource = {
      title: '',
      description: '',
      fileType: 'document',
      category: '',
      tags: [],
      isPublic: true
    };
    this.selectedFiles = [];
    this.uploadProgress = 0;
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      this.selectedFiles = Array.from(files);
    }
  }

  async uploadFiles() {
    if (this.selectedFiles.length === 0 || !this.newResource.title) {
      alert('Por favor selecciona archivos y completa el título');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    const progressInterval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(progressInterval);
        this.finishUpload();
      }
    }, 200);
  }

  private finishUpload() {
    const newResource: RepositoryResource = {
      id: 'RES-' + (this.resources.length + 1).toString().padStart(3, '0'),
      title: this.newResource.title!,
      description: this.newResource.description!,
      fileType: this.newResource.fileType! as any,
      category: this.newResource.category!,
      tags: this.newResource.tags!,
      fileSize: this.selectedFiles.reduce((acc, file) => acc + (file.size / (1024 * 1024)), 0),
      uploadDate: new Date(),
      uploader: 'Docente Actual', 
      downloadCount: 0,
      viewCount: 0,
      isPublic: this.newResource.isPublic!
    };

    this.resources.unshift(newResource);
    this.applyFilters();

    this.isUploading = false;
    this.showUploadModal = false;
    
    alert('¡Archivos subidos exitosamente!');
  }

  removeSelectedFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  getFileIcon(fileType: string): string {
    const type = this.fileTypes.find(t => t.value === fileType);
    return type ? type.icon : 'bi-file-earmark';
  }

  formatFileSize(sizeMB: number): string {
    if (sizeMB < 1) {
      return (sizeMB * 1024).toFixed(0) + ' KB';
    }
    return sizeMB.toFixed(1) + ' MB';
  }

  getFileTypeClass(fileType: string): string {
    const classes: { [key: string]: string } = {
      'pdf': 'bg-danger',
      'video': 'bg-info',
      'image': 'bg-success',
      'document': 'bg-primary',
      'link': 'bg-warning',
      'other': 'bg-secondary'
    };
    return classes[fileType] || 'bg-secondary';
  }

  downloadResource(resource: RepositoryResource) {
    resource.downloadCount++;
    this.applyFilters(); 
    alert(`Iniciando descarga de: ${resource.title}`);
  }

  viewResource(resource: RepositoryResource) {
    resource.viewCount++;
    this.applyFilters(); 
    alert(`Abriendo: ${resource.title}`);
  }

  deleteResource(resourceId: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este recurso?')) {
      this.resources = this.resources.filter(r => r.id !== resourceId);
      this.applyFilters(); 
      alert('Recurso eliminado correctamente');
    }
  }
  getCurrentSortLabel(): string {
    const option = this.sortOptions.find(opt => opt.value === this.sortBy);
    return option ? option.label : 'Fecha de subida';
  }

  addTagFromSuggestion(tag: string) {
    if (tag && !this.searchTags.includes(tag)) {
      this.searchTags.push(tag);
      this.currentTagInput = '';
      this.applyFilters();
    }
  }

  applyFiltersAndClose() {
      this.applyFilters();
      this.showSearchModal = false;
  }

  closeUploadModal() {
      this.showUploadModal = false;
      this.resetUploadForm();
  }

  getFileSizeDisplay(sizeInBytes: number): string {
      const sizeInMB = sizeInBytes / (1024 * 1024);
      return this.formatFileSize(sizeInMB);
  }
}