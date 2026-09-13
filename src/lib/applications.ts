import type { ApplicationStatus, JoinApplication, Project } from "../types"

export function pendingApplications(project: Project): JoinApplication[] {
  return (project.applications ?? []).filter((item) => item.status === "pending")
}

export function applicationForPeer(project: Project, peerId: string): JoinApplication | undefined {
  return (project.applications ?? []).find((item) => item.peerId === peerId)
}

export function myApplications(
  projects: Project[],
  peerId: string,
): Array<{ project: Project; application: JoinApplication }> {
  return projects.flatMap((project) => {
    const application = applicationForPeer(project, peerId)
    return application ? [{ project, application }] : []
  })
}

export function countByStatus(applications: JoinApplication[], status: ApplicationStatus): number {
  return applications.filter((item) => item.status === status).length
}
