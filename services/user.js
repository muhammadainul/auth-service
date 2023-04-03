const moment = require('moment');
const { split, isEmpty, toString } = require('lodash');
const jwt = require('jsonwebtoken');
const { uuid } = require('uuidv4');
const debug = require('debug');
const log = debug('auth-service:services:');

const { 
    Users, 
    Gambar, 
    Pegawai, 
    // Jabatan,
    Satker,
    Logs, 
    Session 
} = require('../models');
const { Op } = require('sequelize');

const { verifyPassword } = require('../helpers/password');
const { Post } = require('../helpers/helpers');

async function SignIn (userData) {
    const { 
        username, 
        password, 
        // satker_id,
        ip_address, 
        browser, 
        browser_version, 
        os,
        mobile = false 
    } = userData;
    log('[Auth Service] SignIn', userData);
    try {
        // if (typeof satker_id == undefined) throw { error: 'Satker harus dilampirkan.' };

        if (!username || !password) {
            throw { error: 'Username / NIP, password, dan satker harus diisi.' };
        }

        // const checkSatker = await Satker.findOne({
        //     where: { id: satker_id },
        //     raw: true
        // });
        // if (!checkSatker) throw { error: 'Satker tidak tersedia.' };
        
        const data = await Users.findOne({ 
            where: { 
                [Op.or]: [
                    { username }, 
                    { nip: username }
                ]
            },
            raw: true
        })
        if (!data) {
            throw { error: 'Username atau NIP tidak tersedia.' };
        }

        // if (data.satker_id !== satker_id) throw { error: `Satker ${checkSatker.nama_satker} bukan satker anda!` };

        if (data.enabled == false) throw { error: 'User tidak aktif. Silahkan hubungi administrator.' };

        if (data.kewenangan_id == null) throw { error: 'Role pengguna belum ditentukan. Silahkan hubungi administrator.' };

        const checkPassword = await verifyPassword(
            password,
            data.password
        );
        if (!data || !checkPassword) {
            throw { error: 'Username atau password tidak sesuai.' };
        }

        await Logs.create({
            ip_address,
            browser,
            browser_version,
            os,
            logdetail: `(Login) ke dalam aplikasi`,
            user_id: data.id
        });

        const userRecord = await Users.findOne({
            include: [
                {
                    model: Satker,
                    attributes: [
                        'id',
                        'kode_satker', 
                        'nama_satker', 
                        'akronim', 
                        'lokasi'
                    ],
                    as: 'satker'
                },
                { 
                    model: Gambar,
                    attributes: [
                        'id', 
                        'filename', 
                        'originalname', 
                        'path', 
                        'destination'
                    ],
                    as: 'files',
                },
                {
                    model: Pegawai,
                    attributes: [
                        ['id', 'pegawai_id'], 
                        'user_id',
                        'departemen',
                        'jabatan'
                    ],
                    as: 'pegawai'
                }
            ],
            where: { id: data.id },
            raw: true,
            nest: true
        });

        const access_token = jwt.sign({ 
            id: data.id,
            ip_address,
            browser: !isEmpty(browser) ? browser : null,
            browser_version: !isEmpty(browser_version) ? browser_version : null,
            os,
            }, config.myConfig.sessionSecret, 
            {}
        );

        if (mobile) var name = 'mobile-' + uuid();
            else var name = 'web-' + uuid();

        const consumerOauth2 = await Post({
            url:
                config.myConfig.api_gateway_admin +
                `consumers/${userRecord.consumer_id}/oauth2`,
            body: {
                name,
                redirect_uris: ['http://localhost/']
            }
        });

        const getToken = await Post({
            url: config.myConfig.api_gateway_url + 'core/oauth2/token',
            body: {
                client_id: consumerOauth2.client_id,
                client_secret: consumerOauth2.client_secret,
                provision_key: 'oauth2provisionkey',
                authenticated_userid: toString(userRecord.id),
                grant_type: 'password',
                scope: 'read write'
            }
        });

        const newSessionEntry = await Session.create({
            user_id: userRecord.id,
            client_id: consumerOauth2.client_id,
            client_secret: consumerOauth2.client_secret,
            access_token: getToken.access_token,
            refresh_token: getToken.refresh_token,
            expires: moment().add(getToken.expires_in, 'milliseconds')
        });

        await Users.update({
            last_login: moment().format()
        },
        { where: { id: data.id } }
        );

        // const newSession = await Session.create({
        //     user_id: data.id,
        //     client_id: null,
        //     client_secret: null,
        //     access_token,
        //     refresh_token,
        //     expires: moment().add(config.myConfig.expiredSessionTime.slice(0,1), 'hours')
        // });

        return {
            message: 'Login berhasil.',
            user: await Users.findOne({
                include: [
                    {
                        model: Satker,
                        attributes: [
                            'id',
                            'kode_satker', 
                            'nama_satker', 
                            'akronim', 
                            'lokasi'
                        ],
                        as: 'satker'
                    },
                    { 
                        model: Gambar,
                        attributes: [
                            'id', 
                            'filename', 
                            'originalname', 
                            'path', 
                            'destination'
                        ],
                        as: 'files',
                    },
                    {
                        model: Pegawai,
                        attributes: [
                            ['id', 'pegawai_id'], 
                            'user_id',
                            'departemen',
                            'jabatan'
                        ],
                        as: 'pegawai'
                    }
                ],
                where: { id: data.id },
                raw: true,
                nest: true
            }),
            session: {
                client_id: newSessionEntry.client_id,
                client_secret: newSessionEntry.client_secret,
                access_token: newSessionEntry.access_token,
                refresh_token: newSessionEntry.refresh_token,
                expires: newSessionEntry.expires,
                simandesk_token: access_token
            }
        }
    } catch (error) {
        return error;
    }
}

async function SignOut (bearerToken, user) {
    const { authorization } = bearerToken;
    const access_token = split(authorization, ' ')[1];
    log('[Auth] SignOut', { access_token, user });
    try {
        const checkSession = await Session.findOne({
            where: { access_token },
            raw: true
        });
        if (!checkSession) {
            throw { error: 'Session tidak tersedia.' };
        }

        await Session.destroy({ where: { id: checkSession.id }} );

        await Logs.create({
            ip_address: user.ip_address,
            browser: user.browser,
            browser_version: user.browser_version,
            os: user.os,
            logdetail: `(Logout) aplikasi`,
            user_id: user.id
        })

        return {
            message: 'Logout berhasil.',
            session: checkSession
        };
    } catch (error) {
        return error;
    }
}

async function RefreshToken (bearerToken, userData) {
    const { authorization } = bearerToken;
    const { refresh_token } = userData;
    const access_token = split(authorization, ' ')[1];
    log('[Auth] Refresh Token', { access_token, refresh_token });
    try {
        if (!refresh_token || !access_token) throw { error: 'Token harus dilampirkan.' };

        const sessionData = await Session.findOne({
            where: { access_token, refresh_token }
        });
        if (!sessionData)
            throw {
                error: 'Session tidak tersedia.'
            };

        const getToken = await Post({
            url: config.myConfig.api_gateway_url + 'core/oauth2/token',
            body: {
                client_id: sessionData.client_id,
                client_secret: sessionData.client_secret,
                refresh_token,
                grant_type: 'refresh_token'
            }
        });

        await Session.update(
            {
                access_token: getToken.access_token,
                refresh_token: getToken.refresh_token,
                expires: moment().add(getToken.expires_in, 'milliseconds')
            },
            { where: { id: sessionData.id } }
        );

        return {
            message: 'Access Token berhasil diperbaharui.',
            session: await Session.findOne({
                where: { id: sessionData.id }
            })
        };
    } catch (error) {
        return error;
    }
}

module.exports = {
    SignIn,
    SignOut,
    RefreshToken
}