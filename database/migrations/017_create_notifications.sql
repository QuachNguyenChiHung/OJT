-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    n_id VARCHAR(36) PRIMARY KEY,
    u_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'ORDER_UPDATE',
    reference_id VARCHAR(36),
    is_read BOOLEAN DEFAULT FALSE,
    created_at BIGINT NOT NULL
);

-- Index for faster queries
CREATE INDEX idx_notifications_user ON notifications(u_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
