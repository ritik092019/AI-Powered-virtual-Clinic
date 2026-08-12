export type ConsultationSocketEvent =
  | 'doctor_request_created'
  | 'doctor_request_accepted'
  | 'doctor_message'
  | 'risk_updated'
  | 'consultation_updated'
  | 'consultation_completed'
  | 'connection_status';

export type SocketEventListener = (payload: any) => void;

class ConsultationSocketService {
  private listeners: Map<ConsultationSocketEvent, Set<SocketEventListener>> = new Map();
  private isConnected = true;

  constructor() {
    // Initialized in connected state
  }

  public on(event: ConsultationSocketEvent, listener: SocketEventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  public off(event: ConsultationSocketEvent, listener: SocketEventListener): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(listener);
    }
  }

  public emit(event: ConsultationSocketEvent, payload: any): void {
    if (!this.isConnected) {
      console.warn('[MockSocketService] Cannot emit event - socket disconnected.');
      return;
    }
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(payload);
        } catch (err) {
          console.error(`[MockSocketService] Error in event listener for ${event}:`, err);
        }
      });
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public setConnectionStatus(status: boolean): void {
    this.isConnected = status;
    this.emit('connection_status', { isConnected: status });
  }

  // Helper trigger methods for explicit UI actions/demos
  public triggerDoctorRequestCreated(payload: any): void {
    this.emit('doctor_request_created', payload);
  }

  public triggerDoctorRequestAccepted(payload: any): void {
    this.emit('doctor_request_accepted', payload);
  }

  public triggerDoctorMessage(payload: any): void {
    this.emit('doctor_message', payload);
  }

  public triggerRiskUpdated(payload: any): void {
    this.emit('risk_updated', payload);
  }

  public triggerConsultationUpdated(payload: any): void {
    this.emit('consultation_updated', payload);
  }

  public triggerConsultationCompleted(payload: any): void {
    this.emit('consultation_completed', payload);
  }
}

export const consultationSocketService = new ConsultationSocketService();
