import puppeteer from 'puppeteer-extra'
import stealth from 'puppeteer-extra-plugin-stealth'

puppeteer.use(stealth())

interface InfoDTO {
  platform: string
  uuid: string
  name: string
  userId: string
  avatar: string
  tierName: string
  rank: string
  peakRank: string
  ranked: any
  deathmatch: any
  segments: any
  weapons: any
  maps: any
  matchs: any
}

export default class API {
  _raw: any
  username: string
  tag: string

  constructor(username: string, tag: string) {
    this.username = username
    this.tag = tag
  }

  static async request(url: string) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    const response = await page.goto(url)
    const body = await response.text()

    await browser.close()
    return JSON.parse(body)
  }

  static async getUser(username: string, tag: string) {
    const api = new API(username, tag)

    api._raw = await this.request(
      `https://api.tracker.gg/api/v2/valorant/standard/profile/riot/${username}%23${tag}`
    )

    api._raw.weapons = await this.request(
      `https://api.tracker.gg/api/v2/valorant/standard/profile/riot/${username}%23${tag}/segments/weapon`
    )

    api._raw.maps = await this.request(
      `https://api.tracker.gg/api/v2/valorant/standard/profile/riot/${username}%23${tag}/segments/map`
    )

    if (api._raw.errors) throw new Error(api._raw.errors[0].message)

    if (api._raw.weapons.errors)
      throw new Error(api._raw.weapons.errors[0].message)

    if (api._raw.maps.errors) throw new Error(api._raw.maps.errors[0].message)

    return api
  }

  info() {
    const platform = this._raw.data.platformInfo
    const ranked = this._raw.data.segments.find(
      (x: any) => x.attributes?.key == 'competitive' && x.type == 'playlist'
    )
    const deathmatch = this._raw.data.segments.find(
      (x: any) => x.attributes?.key == 'deathmatch' && x.type == 'playlist'
    )

    const currentRank = ranked.stats.rank
    const peakRank = ranked.stats.peakRank

    const result: InfoDTO = {
      platform: platform.platformSlug,
      uuid: platform.platformUserId,
      name: platform.platformUserHandle,
      userId: platform.platformUserIdentifier,
      avatar: platform.avatarUrl,
      tierName: currentRank.metadata.tierName,
      rank: `${currentRank.metadata.tierName} - ${currentRank.value}RR`,
      peakRank: `${peakRank.metadata.tierName} - ${peakRank.value}RR`,
      ranked: ranked.stats,
      deathmatch: deathmatch.stats,
      segments: this._raw.data.segments,
      weapons: this._raw.weapons.data,
      maps: this._raw.maps.data,
      matchs: this._raw.matchs.data.matches
    }

    return result
  }

  get raw() {
    return this._raw
  }
}
