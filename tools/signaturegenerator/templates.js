window.getTemplate = function (id, data, color) {
    const mainColor = color;
    const textColor = "#000000";
    const mutedColor = "#666666";

    // Social Icons generator
    const socials = [
        { key: 'social_facebook', slug: 'facebook-new' },
        { key: 'social_linkedin', slug: 'linkedin' },
        { key: 'social_instagram', slug: 'instagram-new' },
        { key: 'social_upwork', slug: 'upwork' },
        { key: 'social_youtube', slug: 'youtube-play' },
        { key: 'social_telegram', slug: 'telegram-app' }
    ];

    let socialHtml = '';

    // Helper to ensure links have protocol
    const ensureProtocol = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url;
        return 'https://' + url;
    };

    socials.forEach(s => {
        if (data[s.key]) {
            // Using Icons8 CDN for consistent PNG delivery with color support
            // Format: https://img.icons8.com/ios-filled/50/[color]/[slug].png
            const hex = mainColor.replace('#', '');
            const iconSrc = `https://img.icons8.com/ios-filled/50/${hex}/${s.slug}.png`;
            const link = ensureProtocol(data[s.key]);

            socialHtml += `
                <a href="${link}" target="_blank" style="text-decoration: none; display: inline-block; margin-right: 8px;">
                    <img src="${iconSrc}" width="24" height="24" alt="${s.slug}" style="display: block; width: 24px; height: 24px;">
                </a>
            `;
        }
    });

    // --- TEMPLATE 1: Modern Minimal ---
    if (id === 1) {
        return `
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Arial', sans-serif; font-size: 14px; line-height: 1.4; color: ${textColor};">
                <tr>
                    <td style="padding-bottom: 8px;">
                        <strong style="font-size: 18px; color: ${mainColor};">${data.name}</strong><br>
                        <span style="color: ${mutedColor}; letter-spacing: 1px; font-size: 12px; text-transform: uppercase;">${data.position}</span>
                    </td>
                </tr>
                <tr>
                    <td style="border-top: 2px solid ${mainColor}; padding-top: 8px; padding-bottom: 8px;">
                         <strong style="color: ${textColor};">${data.company}</strong>
                    </td>
                </tr>
                <tr>
                    <td style="padding-bottom: 12px;">
                        <a href="mailto:${data.email}" style="color: ${mutedColor}; text-decoration: none;">${data.email}</a> <span style="color: ${mainColor}; margin: 0 5px;">•</span> 
                        <span style="color: ${mutedColor};">${data.phone}</span>
                        ${data.office_phone ? `<span style="color: ${mainColor}; margin: 0 5px;">•</span> <span style="color: ${mutedColor};">${data.office_phone}</span>` : ''}<br>
                        <span style="color: ${mutedColor};">${data.location}</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        ${socialHtml}
                    </td>
                </tr>
            </table>
        `;
    }

    // --- TEMPLATE 2: Professional Split (Avatar Left) ---
    if (id === 2) {
        return `
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Helvetica', sans-serif; font-size: 13px; line-height: 1.5; color: ${textColor};">
                <tr>
                    <td style="vertical-align: top; padding-right: 20px;">
                        <img src="${data.avatar}" alt="${data.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; display: block;">
                    </td>
                    <td style="vertical-align: top; border-left: 1px solid #ddd; padding-left: 20px;">
                        <h2 style="margin: 0; font-size: 16px; color: ${textColor}; font-weight: bold;">${data.name}</h2>
                        <p style="margin: 0 0 10px 0; color: ${mainColor}; font-size: 12px; font-weight: 600;">${data.position.toUpperCase()}</p>
                        
                        <p style="margin: 0; color: ${mutedColor};">
                            <span style="color: ${mainColor}; font-weight: bold;">E:</span> <a href="mailto:${data.email}" style="text-decoration: none; color: ${mutedColor};">${data.email}</a><br>
                            <span style="color: ${mainColor}; font-weight: bold;">P:</span> ${data.phone}<br>
                            ${data.office_phone ? `<span style="color: ${mainColor}; font-weight: bold;">O:</span> ${data.office_phone}<br>` : ''}
                            <span style="color: ${mainColor}; font-weight: bold;">W:</span> <a href="https://${data.website}" style="text-decoration: none; color: ${mutedColor};">${data.website}</a>
                        </p>
                        
                        <div style="margin-top: 10px;">
                            ${socialHtml}
                        </div>
                    </td>
                </tr>
            </table>
        `;
    }

    // --- TEMPLATE 3: Corporate Box ---
    if (id === 3) {
        return `
             <table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Verdana', sans-serif; font-size: 12px; color: ${textColor}; width: 100%; max-width: 400px;">
                <tr>
                    <td style="background-color: ${mainColor}; height: 4px; width: 100%;"></td>
                </tr>
                <tr>
                    <td style="padding: 15px 0;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td width="60" style="vertical-align: middle; padding-right: 15px;">
                                     <img src="${data.avatar}" alt="Logo" style="width: 50px; height: 50px; border-radius: 4px; display: block;">
                                </td>
                                <td style="vertical-align: middle;">
                                    <strong style="font-size: 16px; color: ${textColor};">${data.name}</strong><br>
                                    <span style="color: ${mutedColor};">${data.position} at ${data.company}</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                 <tr>
                    <td style="border-top: 1px dotted #ccc; padding-top: 10px;">
                        <div style="margin-bottom: 5px;">
                            📍 ${data.location} | 📞 ${data.phone} ${data.office_phone ? `| 🏢 ${data.office_phone}` : ''}
                        </div>
                        <div style="margin-bottom: 5px;">
                            ✉️ <a href="mailto:${data.email}" style="color: ${mainColor}; text-decoration: none;">${data.email}</a>
                        </div>
                         <div>
                            ${socialHtml}
                        </div>
                    </td>
                </tr>
            </table>
        `;
    }

    // --- TEMPLATE 4: Elegant Border ---
    if (id === 4) {
        return `
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Georgia', serif; font-size: 14px; color: ${textColor};">
                <tr>
                    <td style="border-right: 3px solid ${mainColor}; padding-right: 15px; text-align: right;">
                        <strong style="font-size: 20px; display: block; margin-bottom: 4px;">${data.name}</strong>
                        <span style="font-family: 'Arial', sans-serif; font-size: 11px; text-transform: uppercase; color: ${mutedColor}; letter-spacing: 1px;">${data.position}</span>
                    </td>
                    <td style="padding-left: 15px; vertical-align: middle;">
                        <div style="margin-bottom: 4px;">
                            <a href="mailto:${data.email}" style="text-decoration: none; color: ${textColor}; font-style: italic;">${data.email}</a>
                        </div>
                        <div style="margin-bottom: 4px;">
                            <span style="color: ${mutedColor};">${data.phone}</span>
                        </div>
                        ${data.office_phone ? `
                        <div style="margin-bottom: 4px;">
                            <span style="color: ${mutedColor};">${data.office_phone}</span>
                        </div>` : ''}
                        <div style="margin-bottom: 8px;">
                            <a href="https://${data.website}" style="text-decoration: none; color: ${mainColor};">${data.website}</a>
                        </div>
                        <div>
                             ${socialHtml}
                        </div>
                    </td>
                </tr>
            </table>
        `;
    }

    // --- TEMPLATE 5: Banner Style (Logo on top) ---
    if (id === 5) {
        // Horizontal Layout with bottom bar
        return `
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Arial', sans-serif; font-size: 13px; color: ${textColor}; width: 100%; max-width: 500px;">
                <tr>
                    <td style="padding-bottom: 15px; text-align: center;">
                         <img src="${data.avatar}" alt="Avatar" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid ${mainColor}; padding: 2px;">
                         <div style="margin-top: 10px;">
                             <strong style="font-size: 18px;">${data.name}</strong><br>
                             <span style="color: ${mainColor}; font-weight: bold;">${data.position}</span>
                         </div>
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #f5f5f5; padding: 10px 20px; border-radius: 8px; text-align: center;">
                        <span style="margin: 0 10px;">✉️ <a href="mailto:${data.email}" style="text-decoration: none; color: ${mutedColor};">${data.email}</a></span>
                        <span style="margin: 0 10px;">📞 ${data.phone}</span>
                        ${data.office_phone ? `<span style="margin: 0 10px;">🏢 ${data.office_phone}</span>` : ''}
                        <span style="margin: 0 10px;">🌐 ${data.website}</span>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: center; padding-top: 15px;">
                        ${socialHtml}
                    </td>
                </tr>
            </table>
        `;
    }

    // --- TEMPLATE 6: Premium Modern Gradient ---
    if (id === 6) {
        return `
            <div style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;">
                <style>
                    @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
                    .stagger-1 { animation: slideInUp 0.5s ease-out forwards; opacity: 0; animation-delay: 0.1s; }
                    .stagger-2 { animation: slideInUp 0.5s ease-out forwards; opacity: 0; animation-delay: 0.2s; }
                    .stagger-3 { animation: slideInUp 0.5s ease-out forwards; opacity: 0; animation-delay: 0.3s; }
                </style>
                <table cellpadding="0" cellspacing="0" border="0" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px -10px rgba(0,0,0,0.2); min-width: 340px; border: 1px solid #f0f0f0;">
                    <tr>
                        <td width="10" style="background: linear-gradient(180deg, ${mainColor}, ${mainColor}aa); position: relative; overflow: hidden;">
                            <div style="position: absolute; top:0; left:0; width: 100%; height: 100%; background: linear-gradient(45deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 60%); background-size: 200% auto; animation: shimmer 3s infinite linear;"></div>
                        </td>
                        <td style="padding: 28px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td valign="top">
                                        <div class="stagger-1">
                                            <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: ${textColor}; letter-spacing: -0.5px; line-height: 1.2;">${data.name}</h1>
                                            <p style="margin: 4px 0 0 0; color: ${mainColor}; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">${data.position}</p>
                                        </div>
                                        
                                        <div class="stagger-2" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #f5f5f5;">
                                            <table cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td style="padding-bottom: 8px;">
                                                        <a href="mailto:${data.email}" style="text-decoration: none; color: ${mutedColor}; font-size: 13px; display: flex; align-items: center; transition: color 0.2s;">
                                                            <span style="display:inline-block; width: 6px; height: 6px; background: ${mainColor}; border-radius: 50%; margin-right: 10px; vertical-align: middle;"></span>
                                                            <span style="border-bottom: 1px solid transparent; transition: border-color 0.2s;">${data.email}</span>
                                                        </a>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding-bottom: 8px;">
                                                        <span style="color: ${mutedColor}; font-size: 13px; display: flex; align-items: center;">
                                                            <span style="display:inline-block; width: 6px; height: 6px; background: ${mainColor}; border-radius: 50%; margin-right: 10px; vertical-align: middle;"></span>
                                                            ${data.phone}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <a href="https://${data.website}" style="text-decoration: none; color: ${mutedColor}; font-size: 13px; display: flex; align-items: center;">
                                                            <span style="display:inline-block; width: 6px; height: 6px; background: ${mainColor}; border-radius: 50%; margin-right: 10px; vertical-align: middle;"></span>
                                                            <span style="font-weight: 600; color: ${mainColor};">${data.website}</span>
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>

                                        <div class="stagger-3" style="margin-top: 20px; display: flex; align-items: center;">
                                            ${socialHtml}
                                        </div>
                                    </td>
                                    <td width="110" valign="top" align="right" style="padding-left: 24px;">
                                        <div class="stagger-1" style="width: 90px; height: 90px; position: relative;">
                                            <div style="position: absolute; inset: 0; border-radius: 20px; background: ${mainColor}; opacity: 0.15; transform: rotate(8deg);"></div>
                                            <div style="position: absolute; inset: 0; border-radius: 20px; background: ${mainColor}; opacity: 0.1; transform: rotate(-4deg);"></div>
                                            <img src="${data.avatar}" alt="${data.name}" style="width: 90px; height: 90px; border-radius: 20px; object-fit: cover; position: relative; display: block; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                                        </div>
                                        <div class="stagger-2" style="margin-top: 15px; font-weight: 700; font-size: 11px; color: ${textColor}; text-align: center; opacity: 0.4; letter-spacing: 0.5px;">${data.company}</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>
        `;
    }

    // --- TEMPLATE 7: Premium Pulse Circle ---
    if (id === 7) {
        return `
            <div style="font-family: 'Inter', sans-serif;">
                <style>
                    @keyframes fadeScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                    @keyframes ripple { 
                        0% { box-shadow: 0 0 0 0 ${mainColor}40, 0 0 0 0 ${mainColor}40; } 
                        80% { box-shadow: 0 0 0 20px transparent, 0 0 0 40px transparent; } 
                        100% { box-shadow: 0 0 0 0 transparent, 0 0 0 0 transparent; } 
                    }
                    .anim-container { animation: fadeScale 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
                </style>
                <table cellpadding="0" cellspacing="0" border="0" class="anim-container">
                    <tr>
                        <td style="padding-right: 40px; position: relative;">
                            <div style="padding: 6px; border-radius: 50%; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                                <div style="padding: 4px; border-radius: 50%; border: 2px solid ${mainColor}; animation: ripple 3s infinite ease-out;">
                                    <img src="${data.avatar}" alt="${data.name}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; display: block; border: 4px solid white;">
                                </div>
                            </div>
                        </td>
                        <td valign="middle">
                            <h2 style="margin: 0; font-size: 36px; font-weight: 800; color: ${textColor}; letter-spacing: -1.5px; line-height: 1;">${data.name}</h2>
                            <p style="margin: 8px 0 24px 0; color: ${mainColor}; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 3px; border-left: 3px solid ${mainColor}; padding-left: 12px;">${data.position}</p>
                            
                            <table cellpadding="0" cellspacing="0" border="0" style="background: #fafafa; border-radius: 8px; padding: 12px 16px;">
                                <tr>
                                    <td style="padding-right: 20px; border-right: 1px solid #e0e0e0;">
                                        <div style="margin-bottom: 6px; display: flex; align-items: center;">
                                            <span style="font-size: 14px; margin-right: 6px;">✉️</span>
                                            <a href="mailto:${data.email}" style="color: ${mutedColor}; text-decoration: none; font-size: 13px; font-weight: 500;">${data.email}</a>
                                        </div>
                                        <div style="display: flex; align-items: center;">
                                            <span style="font-size: 14px; margin-right: 6px;">📞</span>
                                            <span style="color: ${mutedColor}; font-size: 13px;">${data.phone}</span>
                                        </div>
                                    </td>
                                    <td style="padding-left: 20px;">
                                        <div style="margin-bottom: 8px;">
                                            ${socialHtml}
                                        </div>
                                        <a href="https://${data.website}" style="color: ${mainColor}; text-decoration: none; font-size: 12px; font-weight: 700; display: inline-block; border-bottom: 1px dashed ${mainColor};">${data.website}</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>
        `;
    }

    // --- TEMPLATE 8: Glassmorphism Card ---
    if (id === 8) {
        return `
            <div style="font-family: 'Inter', sans-serif;">
                <style>
                    @keyframes glassEntrance { 
                        0% { opacity: 0; transform: perspective(1000px) rotateX(10deg) translateY(20px); } 
                        100% { opacity: 1; transform: perspective(1000px) rotateX(0) translateY(0); } 
                    }
                    @keyframes shine {
                        0% { left: -100%; }
                        20% { left: 100%; }
                        100% { left: 100%; }
                    }
                    .glass-card {
                        animation: glassEntrance 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; 
                        opacity: 0; 
                        position: relative; 
                        overflow: hidden;
                    }
                    .shine-effect {
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 50%;
                        height: 100%;
                        background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
                        transform: skewX(-25deg);
                        animation: shine 6s infinite;
                        pointer-events: none;
                    }
                </style>
                <div class="glass-card" style="width: 400px; background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,247,250,0.9) 100%); border: 1px solid rgba(255,255,255,1); border-radius: 20px; box-shadow: 0 15px 35px 0 rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0,0,0,0.05); backdrop-filter: blur(10px);">
                    <div class="shine-effect"></div>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                            <td align="center" style="padding: 35px 25px;">
                                <!-- Avatar with Gradient Ring -->
                                <div style="position: relative; width: 100px; height: 100px; margin-bottom: 20px;">
                                    <div style="position: absolute; inset: -3px; border-radius: 50%; background: linear-gradient(45deg, ${mainColor}, #000000); opacity: 0.8;"></div>
                                    <img src="${data.avatar}" alt="${data.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid white; position: relative; display: block; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                                </div>
                                
                                <h2 style="margin: 0; font-size: 24px; color: ${textColor}; font-weight: 800; letter-spacing: -0.5px;">${data.name}</h2>
                                <p style="margin: 8px 0 24px 0; color: ${mainColor}; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; background: ${mainColor}10; display: inline-block; padding: 6px 16px; border-radius: 100px;">${data.position}</p>
                                
                                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top: 1px solid rgba(0,0,0,0.06); padding-top: 24px;">
                                    <tr>
                                        <td align="center" style="padding-bottom: 12px;">
                                            <a href="mailto:${data.email}" style="color: ${mutedColor}; text-decoration: none; font-size: 14px; font-weight: 500; margin: 0 10px; transition: color 0.2s;">${data.email}</a>
                                            <span style="color: #e5e5e5; font-size: 10px;">●</span>
                                            <span style="color: ${mutedColor}; font-size: 14px; font-weight: 500; margin: 0 10px;">${data.phone}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding-bottom: 24px;">
                                            <a href="https://${data.website}" style="color: ${mainColor}; text-decoration: none; font-size: 14px; font-weight: 600; opacity: 0.9;">${data.website}</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center">
                                            <div style="background: white; padding: 8px 16px; border-radius: 50px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                                                ${socialHtml}
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
    }

    // --- TEMPLATE 9: Gradient Sidebar & Floating ---
    if (id === 9) {
        return `
            <div style="font-family: 'Verdana', sans-serif;">
                <style>
                    @keyframes slideRight { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
                    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .sidebar-anim { animation: slideRight 0.8s cubic-bezier(0.8, 0, 0.2, 1) forwards; }
                    .content-anim { animation: fadeInUp 0.6s ease-out 0.4s forwards; opacity: 0; }
                </style>
                <table cellpadding="0" cellspacing="0" border="0" style="background: white; border-radius: 0 16px 16px 0; box-shadow: 10px 10px 40px -10px rgba(0,0,0,0.1);">
                    <tr>
                        <td width="80" class="sidebar-anim" style="background: linear-gradient(to bottom, ${mainColor}, #111); border-radius: 4px 0 0 4px; position: relative;">
                             <!-- Pattern Overlay handled via CSS radial gradient if simple, or just keeps solid gradient -->
                             <div style="width: 80px; height: 100%; text-align: center; vertical-align: top; padding-top: 30px;">
                                 <div style="color: rgba(255,255,255,0.2); font-size: 40px; font-family: serif; font-weight: bold;">“</div>
                             </div>
                        </td>
                        <td style="padding: 20px 30px 20px 30px;" valign="top">
                            <div class="content-anim">
                                <h2 style="margin: 0; font-size: 28px; color: ${textColor}; font-weight: 800; font-family: 'Helvetica', sans-serif; letter-spacing: -0.5px;">${data.name}</h2>
                                <p style="margin: 6px 0 20px 0; color: ${mainColor}; font-family: 'Georgia', serif; font-style: italic; font-size: 15px; font-weight: 500;">${data.position}</p>
                                
                                <div style="display: flex; gap: 20px; align-items: start; margin-bottom: 20px;">
                                    ${data.company ? `
                                    <div style="padding-right: 20px; border-right: 2px solid #f5f5f5;">
                                        <div style="font-size: 10px; color: #aaa; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 4px;">Company</div>
                                        <div style="font-size: 14px; color: ${textColor}; font-weight: 700;">${data.company}</div>
                                    </div>` : ''}
                                    <div>
                                        <div style="font-size: 10px; color: #aaa; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 4px;">Connect</div>
                                        <div style="font-size: 14px; color: ${textColor};">
                                            <a href="mailto:${data.email}" style="text-decoration: none; color: ${textColor}; box-shadow: inset 0 -2px 0 ${mainColor}40;">${data.email}</a>
                                        </div>
                                    </div>
                                </div>
    
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="background: #f9f9f9; padding: 12px 16px; border-radius: 8px;">
                                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                <tr>
                                                    <td style="color: ${mutedColor}; font-size: 13px;">
                                                        📍 ${data.location}
                                                    </td>
                                                    <td align="right">
                                                        ${socialHtml}
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        `;
    }

    // --- TEMPLATE 10: Exclusive Member Card ---
    if (id === 10) {
        return `
             <div style="font-family: 'Mono', monospace;">
                <style>
                    @keyframes flipInX { from { opacity: 0; transform: perspective(1000px) rotateX(90deg); } to { opacity: 1; transform: perspective(1000px) rotateX(0); } }
                    @keyframes holoShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                    .card-container { animation: flipInX 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; transform-origin: top; }
                    .holo-strip {
                        background: linear-gradient(270deg, ${mainColor}, #ffeebb, ${mainColor}, #a1c4fd);
                        background-size: 400% 400%;
                        animation: holoShift 10s ease infinite;
                    }
                </style>
                <table cellpadding="0" cellspacing="0" border="0" class="card-container" style="width: 420px; background: #0f0f0f; color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
                    <tr>
                         <td style="padding: 0;">
                             <!-- Top Header Holo Strip -->
                             <div class="holo-strip" style="height: 6px; width: 100%;"></div>
                             
                             <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                 <tr>
                                     <td style="padding: 30px;">
                                         <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                             <tr>
                                                 <td width="80">
                                                     <div style="padding: 3px; background: linear-gradient(135deg, ${mainColor}, #333); border-radius: 14px;">
                                                        <img src="${data.avatar}" alt="${data.name}" style="width: 64px; height: 64px; border-radius: 12px; object-fit: cover; display: block; filter: contrast(1.1);">
                                                     </div>
                                                 </td>
                                                 <td style="padding-left: 20px;">
                                                     <div style="font-size: 9px; font-weight: 700; color: ${mainColor}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; border: 1px solid ${mainColor}40; display: inline-block; padding: 2px 6px; border-radius: 4px;">Verified Member</div>
                                                     <h2 style="margin: 0; font-size: 22px; font-weight: 500; color: white; letter-spacing: -0.5px;">${data.name}</h2>
                                                     <p style="margin: 4px 0 0 0; font-size: 13px; color: #888; font-weight: 300;">${data.position}</p>
                                                 </td>
                                                 <td align="right" valign="top">
                                                     <!-- Realistic Chip -->
                                                     <div style="width: 40px; height: 28px; background: linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #FFD700 100%); border-radius: 6px; position: relative; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.2);">
                                                         <div style="position: absolute; top: 50%; left: 0; width: 100%; height: 1px; background: rgba(0,0,0,0.3);"></div>
                                                         <div style="position: absolute; top: 0; left: 30%; width: 1px; height: 100%; background: rgba(0,0,0,0.3);"></div>
                                                         <div style="position: absolute; top: 0; left: 70%; width: 1px; height: 100%; background: rgba(0,0,0,0.3);"></div>
                                                     </div>
                                                 </td>
                                             </tr>
                                         </table>
                                         
                                         <div style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #222;">
                                             <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                 <tr>
                                                     <td style="width: 55%; vertical-align: top;">
                                                         <div style="font-size: 9px; color: #555; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Contact Info</div>
                                                         <a href="mailto:${data.email}" style="font-size: 13px; color: #eee; text-decoration: none; display: block; margin-bottom: 4px;">${data.email}</a>
                                                         <div style="font-size: 13px; color: #888;">${data.phone}</div>
                                                     </td>
                                                     <td style="width: 45%; vertical-align: top;">
                                                          <div style="font-size: 9px; color: #555; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Web</div>
                                                          <a href="https://${data.website}" style="font-size: 13px; color: ${mainColor}; text-decoration: none; border-bottom: 1px solid ${mainColor}40;">${data.website}</a>
                                                     </td>
                                                 </tr>
                                             </table>
                                         </div>
                                     </td>
                                 </tr>
                                 <tr>
                                     <td style="background: #151515; padding: 15px 30px; border-top: 1px solid #222;">
                                         <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                             <tr>
                                                 <td style="color: #444; font-size: 10px; letter-spacing: 2px; font-family: monospace;">ID: 884-29-11 // AUTHENTIC</td>
                                                 <td align="right">
                                                     <div style="filter: invert(1) brightness(100%); opacity: 0.5;">
                                                        ${socialHtml}
                                                     </div>
                                                 </td>
                                             </tr>
                                         </table>
                                     </td>
                                 </tr>
                             </table>
                         </td>
                    </tr>
                </table>
            </div>
        `;
    }



    return '<p>Template not found</p>';
};
