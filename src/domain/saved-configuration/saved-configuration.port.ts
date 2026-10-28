export interface SavedConfiguration {
  id: string
  userId: string
  modelSlug: string
  configurationCode: string
  name: string
  createdAt: Date
}

export interface CreateSavedConfiguration {
  userId: string
  modelSlug: string
  configurationCode: string
  name: string
}

export interface SavedConfigurationRepositoryPort {
  findById(id: string, userId: string): Promise<SavedConfiguration | null>
  findByUserId(userId: string): Promise<readonly SavedConfiguration[]>
  create(input: CreateSavedConfiguration): Promise<SavedConfiguration>
  rename(id: string, userId: string, name: string): Promise<SavedConfiguration | null>
  delete(id: string, userId: string): Promise<boolean>
}
