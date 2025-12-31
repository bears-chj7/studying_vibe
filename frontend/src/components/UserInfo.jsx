import React from 'react';

const UserInfo = ({ user }) => {
    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{
                fontSize: '1.5rem',
                marginBottom: '1.5rem',
                color: '#262626',
                fontWeight: '300'
            }}>User Information</h2>

            <div className="insta-card" style={{ alignItems: 'flex-start' }}>
                <div style={{ marginBottom: '1.5rem', width: '100%' }}>
                    <label style={{ color: '#8e8e8e', fontSize: '12px', fontWeight: '600' }}>USERNAME</label>
                    <div style={{ fontSize: '16px', marginTop: '4px', color: '#262626' }}>{user.username}</div>
                </div>

                <div style={{ marginBottom: '1.5rem', width: '100%' }}>
                    <label style={{ color: '#8e8e8e', fontSize: '12px', fontWeight: '600' }}>NAME</label>
                    <div style={{ fontSize: '16px', marginTop: '4px', color: '#262626' }}>{user.name}</div>
                </div>



                {user.attributes && (
                    <div style={{ marginTop: '2rem', width: '100%', borderTop: '1px solid #efefef', paddingTop: '1rem' }}>
                        <h3 style={{ fontSize: '14px', marginBottom: '1rem', color: '#8e8e8e' }}>EXTENDED ATTRIBUTES</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {Object.entries(user.attributes).map(([key, value]) => (
                                <div key={key} style={{ padding: '0.5rem 0' }}>
                                    <div style={{ color: '#8e8e8e', fontSize: '11px', textTransform: 'uppercase' }}>{key}</div>
                                    <div style={{ fontSize: '14px' }}>{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserInfo;
