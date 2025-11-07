import { supabase } from '../lib/supabase';

export interface AuditLogEntry {
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export class AuditLogger {
  private static adminId: string | null = null;

  // Set current admin ID for logging
  static setAdminId(adminId: string) {
    this.adminId = adminId;
  }

  // Clear admin ID on logout
  static clearAdminId() {
    this.adminId = null;
  }

  // Log admin action
  static async log(entry: AuditLogEntry): Promise<void> {
    if (!this.adminId) {
      console.warn('No admin ID set for audit logging');
      return;
    }

    try {
      // Get client IP and user agent
      const ip_address = await this.getClientIP();
      const user_agent = navigator.userAgent;

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          admin_id: this.adminId,
          action: entry.action,
          table_name: entry.table_name,
          record_id: entry.record_id,
          old_values: entry.old_values,
          new_values: entry.new_values,
          ip_address,
          user_agent
        });

      if (error) {
        console.error('Failed to log audit entry:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  // Log create action
  static async logCreate(tableName: string, recordId: string, newValues: Record<string, any>) {
    await this.log({
      action: `CREATE_${tableName.toUpperCase()}`,
      table_name: tableName,
      record_id: recordId,
      new_values: newValues
    });
  }

  // Log update action
  static async logUpdate(
    tableName: string, 
    recordId: string, 
    oldValues: Record<string, any>, 
    newValues: Record<string, any>
  ) {
    await this.log({
      action: `UPDATE_${tableName.toUpperCase()}`,
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues
    });
  }

  // Log delete action
  static async logDelete(tableName: string, recordId: string, oldValues: Record<string, any>) {
    await this.log({
      action: `DELETE_${tableName.toUpperCase()}`,
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues
    });
  }

  // Log file upload
  static async logFileUpload(fileName: string, filePath: string, fileSize: number) {
    await this.log({
      action: 'UPLOAD_FILE',
      new_values: {
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize
      }
    });
  }

  // Log file delete
  static async logFileDelete(fileName: string, filePath: string) {
    await this.log({
      action: 'DELETE_FILE',
      old_values: {
        file_name: fileName,
        file_path: filePath
      }
    });
  }

  // Get audit logs for admin panel
  static async getAuditLogs(limit: number = 50, offset: number = 0) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          admin:admins(username, email)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get client IP address (best effort)
  private static async getClientIP(): Promise<string | null> {
    try {
      // This is a simple approach - in production you might want to use a more reliable service
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Failed to get client IP:', error);
      return null;
    }
  }
}