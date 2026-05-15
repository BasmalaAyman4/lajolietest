
export interface CollaboratorVoucherOption {
  id: number
  name: string
}

export interface CollaboratorVoucherDetail {
    id: number
    vvalue: number
    fromDate: string
    toDate: string
    maxDeduct: number
    isPercentage: boolean
    collaboratorName: string
    collaboratorId: number
    isStoped: boolean

}

export interface CreateCollaboratorVoucherRequest {
    vvalue: number
    fromDate: string
    toDate: string
    maxDeduct: number
    isPercentage: boolean
    collaboratorId: number
}

export interface UpdateCollaboratorVoucherRequest extends CreateCollaboratorVoucherRequest {
  id: number
}