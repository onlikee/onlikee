export type PresignedUploadTicket = {
  uploadUrl: string
  method: string
  headers: Record<string, string>
}

export const uploadWithPresignedTicket = async (ticket: PresignedUploadTicket, file: File) => {
  const response = await fetch(ticket.uploadUrl, {
    method: ticket.method,
    headers: ticket.headers,
    body: file,
    credentials: 'omit'
  })
  if (!response.ok) {
    throw new Error(`上传失败（HTTP ${response.status}），请重试。`)
  }
}
