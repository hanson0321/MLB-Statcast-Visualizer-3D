# backend/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pybaseball import statcast_pitcher, playerid_lookup, pitching_stats, batting_stats, statcast_batter, statcast, playerid_reverse_lookup
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import aiohttp
import asyncio
from functools import lru_cache
from scipy.stats import percentileofscore

app = FastAPI()

# --- CORS 中介軟體設定 ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 全域快取 ---
@lru_cache(maxsize=2)
def get_league_stats(stat_type: str, year: int):
    print(f"快取未命中：正在下載 {year} 年全聯盟 {stat_type} 數據...")
    try:
        if stat_type == 'batting':
            df = batting_stats(year)
            if 'BB/K' not in df.columns: df['BB/K'] = df['BB'] / df['K']
            if 'Spd' not in df.columns: df['Spd'] = 0
            return df
        elif stat_type == 'pitching':
            df = pitching_stats(year)
            if 'GB%' not in df.columns: df['GB%'] = '0%'
            return df
    except Exception as e:
        print(f"下載 {year} 年 {stat_type} 數據時出錯: {e}")
    return pd.DataFrame()

# --- 輔助函式 ---
async def fetch_player_image(player_id: int):
    url = f"https://securea.mlb.com/mlb/images/players/head_shot/{player_id}.jpg"
    timeout = aiohttp.ClientTimeout(total=10)
    try:
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.head(url, allow_redirects=True) as response:
                if response.status == 200:
                    return str(response.url)
    except Exception as e:
        print(f"獲取頭像時發生錯誤: {e}")
    return None

@lru_cache(maxsize=256)
def get_player_lookup_sync(player_id: int):
    try:
        df = playerid_reverse_lookup([player_id], key_type='mlbam')
        if not df.empty:
            return df.iloc[0].to_dict()
    except Exception as e:
        print(f"透過 ID {player_id} 查詢姓名時出錯: {e}")
    return None

async def get_player_info_by_id(player_id: int):
    loop = asyncio.get_event_loop()
    player_data = await loop.run_in_executor(None, get_player_lookup_sync, player_id)
    if player_data:
        image_url = await fetch_player_image(player_id)
        player_data['image_url'] = image_url
    return player_data

async def get_player_info_by_name(name: str):
    if not isinstance(name, str): name = str(name)
    try:
        last_name, first_name = '', ''
        if ',' in name:
            parts = name.split(',')
            last_name, first_name = parts[0].strip(), parts[1].strip()
        else:
            parts = name.strip().split()
            first_name = parts[0]
            last_name = parts[-1] if len(parts) > 1 else ''
        df = playerid_lookup(last_name, first_name, fuzzy=True)
        if not df.empty:
            player_data = df.iloc[0].copy()
            if pd.notna(player_data['key_mlbam']):
                mlbam_id = int(player_data['key_mlbam'])
                image_url = await fetch_player_image(mlbam_id)
                player_dict = player_data.to_dict()
                player_dict['image_url'] = image_url
                return player_dict
    except Exception as e:
        print(f"獲取球員資訊 '{name}' 時發生錯誤: {e}")
    return None

# --- API 端點 ---
@app.get("/api/player-search")
async def search_player(name: str):
    if not name or len(name) < 2: return []
    try:
        df = playerid_lookup(name, fuzzy=True).dropna(subset=['key_mlbam']).copy()
        if df.empty: return []
        df['name_full'] = df['name_first'].str.title() + ' ' + df['name_last'].str.title()
        
        tasks = [fetch_player_image(int(row['key_mlbam'])) for _, row in df.head(7).iterrows()]
        image_urls = await asyncio.gather(*tasks)
        
        results = [{'name': row['name_full'], 'id': int(row['key_mlbam']), 'image_url': url} for (_, row), url in zip(df.head(7).iterrows(), image_urls)]
        return results
    except Exception as e:
        print(f"搜尋球員時發生錯誤: {e}")
        return []

@app.get("/api/player-season-stats")
async def get_player_season_stats(player_name: str):
    player_info = await get_player_info_by_name(player_name)
    if not player_info:
        raise HTTPException(status_code=404, detail=f"找不到球員 '{player_name}' 的數據")
    
    player_idfg = player_info.get('key_fangraphs')
    current_year = datetime.now().year

    if player_idfg and pd.notna(player_idfg):
        player_idfg = int(player_idfg)
        pitch_stats_df = get_league_stats('pitching', current_year)
        player_pitch_stats = pitch_stats_df[pitch_stats_df['IDfg'] == player_idfg]
        if not player_pitch_stats.empty:
            stats = player_pitch_stats.iloc[0]
            return { "type": "pitcher", "name": player_name, "W": int(stats.get('W', 0)), "L": int(stats.get('L', 0)), "ERA": stats.get('ERA'), "SO": int(stats.get('SO', 0)), "WHIP": stats.get('WHIP'), "IP": stats.get('IP'), "image_url": player_info.get('image_url') }

        bat_stats_df = get_league_stats('batting', current_year)
        player_bat_stats = bat_stats_df[bat_stats_df['IDfg'] == player_idfg]
        if not player_bat_stats.empty:
            stats = player_bat_stats.iloc[0]
            return { "type": "batter", "name": player_name, "AVG": stats.get('AVG'), "HR": int(stats.get('HR', 0)), "RBI": int(stats.get('RBI', 0)), "OBP": stats.get('OBP'), "SLG": stats.get('SLG'), "OPS": stats.get('OPS'), "image_url": player_info.get('image_url') }
    
    raise HTTPException(status_code=404, detail=f"在 FanGraphs 中找不到 {player_name} 在 {current_year} 賽季的數據")

@app.get("/api/pvb-stats")
async def get_pvb_stats_by_name(pitcher: str, batter: str):
    pitcher_info = await get_player_info_by_name(pitcher)
    batter_info = await get_player_info_by_name(batter)
    if not pitcher_info or not batter_info: return {"error": "無效的球員姓名"}
    try:
        data = statcast_pitcher('2017-01-01', '2025-12-31', int(pitcher_info['key_mlbam']))
        matchup_data = data[data['batter'] == int(batter_info['key_mlbam'])].copy()
        if matchup_data.empty: return {"pitcher_name": pitcher, "batter_name": batter, "message": "這兩位球員之間沒有對戰數據"}
        
        final_events = matchup_data.loc[matchup_data.groupby(['game_date', 'at_bat_number'])['pitch_number'].idxmax()]
        events = final_events['events'].dropna()
        at_bats = events[~events.isin(['walk', 'hit_by_pitch', 'sac_fly', 'sac_bunt', 'intentional_walk'])].count()
        hits = events[events.isin(['single', 'double', 'triple', 'home_run'])].count()
        strikeouts = events.str.contains('strikeout').sum()
        walks = events.str.contains('walk|hit_by_pitch').sum()
        home_runs = events.str.contains('home_run').sum()
        batting_average = hits / at_bats if at_bats > 0 else 0
        
        return { "pitcher_name": pitcher, "batter_name": batter, "total_pa": int(len(events)), "at_bats": int(at_bats), "hits": int(hits), "strikeouts": int(strikeouts), "walks": int(walks), "home_runs": int(home_runs), "batting_average": round(batting_average, 3) }
    except Exception as e: return {"error": str(e)}

@app.get("/api/at-bat-timeline")
async def get_at_bat_timeline(pitcher: str, batter: str):
    pitcher_info = await get_player_info_by_name(pitcher)
    batter_info = await get_player_info_by_name(batter)
    if not pitcher_info or not batter_info: return {"error": "無效的球員姓名"}
    try:
        data = statcast_pitcher('2017-01-01', '2025-12-31', int(pitcher_info['key_mlbam']))
        matchup_data = data[data['batter'] == int(batter_info['key_mlbam'])].copy()
        if matchup_data.empty: return []
        
        matchup_data['game_date'] = pd.to_datetime(matchup_data['game_date'])
        timeline = []
        grouped = matchup_data.groupby(['game_date', 'at_bat_number'])
        
        for (game_date, at_bat_number), group in grouped:
            pitches = group.sort_values(by='pitch_number').copy()
            final_event = pitches['events'].dropna().iloc[-1] if not pitches['events'].dropna().empty else "進行中"
            at_bat_details = { "game_date": game_date.strftime('%Y-%m-%d'), "at_bat_number": int(at_bat_number), "final_event": final_event, "pitches": pitches[['pitch_number', 'pitch_name', 'release_speed', 'description']].replace({np.nan: None}).to_dict(orient='records') }
            timeline.append(at_bat_details)
            
        return sorted(timeline, key=lambda x: (x['game_date'], x['at_bat_number']), reverse=True)
    except Exception as e: return {"error": str(e)}

@app.get("/api/outcome-simulator")
async def get_outcome_probabilities(pitcher: str, batter: str):
    pitcher_info = await get_player_info_by_name(pitcher)
    batter_info = await get_player_info_by_name(batter)
    if not pitcher_info or not batter_info: return {"error": "無效的球員姓名"}
    try:
        data = statcast_pitcher('2017-01-01', '2025-12-31', int(pitcher_info['key_mlbam']))
        matchup_data = data[data['batter'] == int(batter_info['key_mlbam'])].copy()
        events = matchup_data.dropna(subset=['events'])
        final_events = events.loc[events.groupby(['game_date', 'at_bat_number'])['pitch_number'].idxmax()]
        if final_events.empty: return {"error": "沒有足夠的對戰數據來進行模擬"}
        
        total_pa = len(final_events)
        outcomes = {
            "Strikeout": final_events['events'].str.contains('strikeout').sum(),
            "Walk": final_events['events'].str.contains('walk|hit_by_pitch').sum(),
            "Single": final_events['events'].str.contains('single').sum(),
            "Double": final_events['events'].str.contains('double').sum(),
            "Triple": final_events['events'].str.contains('triple').sum(),
            "Home Run": final_events['events'].str.contains('home_run').sum(),
        }
        hits_and_walks = sum(outcomes.values())
        outcomes["Out"] = total_pa - hits_and_walks
        probabilities = {key: round((value / total_pa) * 100, 1) for key, value in outcomes.items() if value > 0}
        
        return sorted(probabilities.items(), key=lambda item: item[1], reverse=True)
    except Exception as e: return {"error": str(e)}

@app.get("/api/pitch-arsenal")
async def get_pitch_arsenal(pitcher: str):
    pitcher_info = await get_player_info_by_name(pitcher)
    if not pitcher_info: return {"error": f"找不到投手 '{pitcher}' 的 ID"}
    try:
        current_year = datetime.now().year
        data = statcast_pitcher(f'{current_year}-01-01', f'{current_year}-12-31', int(pitcher_info['key_mlbam']))
        data = data.dropna(subset=['pitch_name'])
        data = data[data['pitch_name'] != '']
        if data.empty: return []
        
        arsenal = data.groupby('pitch_name').agg( usage=('pitch_name', 'count'), avg_speed=('release_speed', 'mean'), max_speed=('release_speed', 'max'), avg_spin=('release_spin_rate', 'mean'), avg_pfx_x=('pfx_x', lambda x: x.mean() * 12), avg_pfx_z=('pfx_z', lambda x: x.mean() * 12) ).reset_index()
        total_pitches = arsenal['usage'].sum()
        arsenal['usage_percentage'] = (arsenal['usage'] / total_pitches) * 100
        arsenal = arsenal.round(1).replace({np.nan: None})
        
        return arsenal.to_dict(orient='records')
    except Exception as e: return {"error": str(e)}

@app.get("/api/pvb-pitch-chart")
async def get_pvb_pitch_chart(pitcher: str, batter: str):
    pitcher_info = await get_player_info_by_name(pitcher)
    batter_info = await get_player_info_by_name(batter)
    if not pitcher_info or not batter_info: return {"error": "無效的球員姓名"}
    try:
        data = statcast_pitcher('2017-01-01', '2025-12-31', int(pitcher_info['key_mlbam']))
        matchup_data = data[data['batter'] == int(batter_info['key_mlbam'])].copy()
        if matchup_data.empty: return []
        
        chart_data = matchup_data[['plate_x', 'plate_z', 'description', 'pitch_name', 'release_speed']].copy().replace({np.nan: None})
        return chart_data.to_dict(orient='records')
    except Exception as e: return {"error": str(e)}

@app.get("/api/pvb-spray-chart")
async def get_pvb_spray_chart(pitcher: str, batter: str):
    pitcher_info = await get_player_info_by_name(pitcher)
    batter_info = await get_player_info_by_name(batter)
    if not pitcher_info or not batter_info: return {"error": "無效的球員姓名"}
    try:
        data = statcast_pitcher('2017-01-01', '2025-12-31', int(pitcher_info['key_mlbam']))
        matchup_data = data[data['batter'] == int(batter_info['key_mlbam'])].copy()
        batted_balls = matchup_data[matchup_data['type'] == 'X'].copy()
        if batted_balls.empty: return []
        
        chart_data = batted_balls[['hc_x', 'hc_y', 'events', 'launch_speed', 'launch_angle']].copy().replace({np.nan: None})
        return chart_data.to_dict(orient='records')
    except Exception as e: return {"error": str(e)}

@app.get("/api/pitch-movement")
async def get_pitch_movement(pitcher: str):
    pitcher_info = await get_player_info_by_name(pitcher)
    if not pitcher_info: return {"error": f"找不到投手 '{pitcher}' 的 ID"}
    try:
        current_year = datetime.now().year
        data = statcast_pitcher(f'{current_year}-01-01', f'{current_year}-12-31', int(pitcher_info['key_mlbam']))
        movement_data = data[['pitch_name', 'pfx_x', 'pfx_z']].dropna().copy()
        if movement_data.empty: return []
        
        movement_data['pfx_x_in'] = movement_data['pfx_x'] * 12
        movement_data['pfx_z_in'] = movement_data['pfx_z'] * 12
        return movement_data[['pitch_name', 'pfx_x_in', 'pfx_z_in']].to_dict(orient='records')
    except Exception as e: return {"error": str(e)}

@app.get("/api/3d-trajectory")
async def get_3d_trajectory(pitcher: str, batter: str):
    pitcher_info = await get_player_info_by_name(pitcher)
    batter_info = await get_player_info_by_name(batter)
    if not pitcher_info or not batter_info: return {"error": "無效的球員姓名"}
    try:
        data = statcast_pitcher('2017-01-01', '2025-12-31', int(pitcher_info['key_mlbam']))
        matchup_data = data[data['batter'] == int(batter_info['key_mlbam'])].copy()
        
        required_columns = ['pitch_type', 'release_speed', 'release_pos_x', 'release_pos_y', 'release_pos_z', 'plate_x', 'plate_z', 'sz_top', 'sz_bot']
        if matchup_data.empty or not all(col in matchup_data.columns for col in required_columns): return []
        
        trajectory_data = matchup_data[required_columns].dropna()
        if trajectory_data.empty: return []
        
        return trajectory_data.to_dict(orient='records')
    except Exception as e:
        print(f"取得 3D 軌跡數據時發生錯誤: {e}")
        return {"error": str(e)}

@app.get("/api/league-avg-movement")
def get_league_avg_movement():
    return {
        "4-Seam Fastball": {"pfx_x_in": -5.0, "pfx_z_in": 8.5}, "Sinker": {"pfx_x_in": -9.0, "pfx_z_in": 5.0},
        "Cutter": {"pfx_x_in": -1.0, "pfx_z_in": 7.0}, "Slider": {"pfx_x_in": 5.0, "pfx_z_in": 1.0},
        "Sweeper": {"pfx_x_in": 10.0, "pfx_z_in": -1.0}, "Curveball": {"pfx_x_in": 7.0, "pfx_z_in": -6.0},
        "Changeup": {"pfx_x_in": -8.0, "pfx_z_in": 3.0}, "Split-Finger": {"pfx_x_in": -6.0, "pfx_z_in": 1.5},
    }

@app.get("/api/player-radar-stats")
async def get_player_radar_stats(player_name: str):
    player_info = await get_player_info_by_name(player_name)
    if not player_info: raise HTTPException(status_code=404, detail="找不到球員")

    player_idfg = player_info.get('key_fangraphs')
    if not player_idfg or not pd.notna(player_idfg): raise HTTPException(status_code=404, detail="找不到球員的 FanGraphs ID，無法計算百分位數")

    player_idfg = int(player_idfg)
    current_year = datetime.now().year
    
    pitch_stats_df = get_league_stats('pitching', current_year)
    player_pitch_stats = pitch_stats_df[pitch_stats_df['IDfg'] == player_idfg] if not pitch_stats_df.empty else pd.DataFrame()

    if not player_pitch_stats.empty:
        stats = player_pitch_stats.iloc[0]
        qualified_pitchers = pitch_stats_df[pitch_stats_df['IP'] >= 40]
        
        try:
            gb_stat = stats['GB%']
            if isinstance(gb_stat, str):
                player_gb_value = float(gb_stat.rstrip('%'))
            else:
                player_gb_value = float(gb_stat)
            qualified_gb_series = qualified_pitchers['GB%'].dropna().apply(lambda x: float(str(x).rstrip('%')))
            gb_percentile = int(percentileofscore(qualified_gb_series, player_gb_value))
        except (ValueError, TypeError) as e:
            print(f"處理 GB% 時出錯: {e}")
            player_gb_value, gb_percentile = 0, 0

        radar_data = [
            {"subject": "三振 K/9", "player_value": round(stats.get('K/9', 0), 2), "percentile": int(percentileofscore(qualified_pitchers['K/9'].dropna(), stats.get('K/9', 0)))},
            {"subject": "控球 BB/9", "player_value": round(stats.get('BB/9', 0), 2), "percentile": 100 - int(percentileofscore(qualified_pitchers['BB/9'].dropna(), stats.get('BB/9', 0)))},
            {"subject": "壓制力 WHIP", "player_value": round(stats.get('WHIP', 0), 2), "percentile": 100 - int(percentileofscore(qualified_pitchers['WHIP'].dropna(), stats.get('WHIP', 0)))},
            {"subject": "耐戰力 IP", "player_value": stats.get('IP', 0), "percentile": int(percentileofscore(qualified_pitchers['IP'].dropna(), stats.get('IP', 0)))},
            {"subject": "滾地球率 GB%", "player_value": player_gb_value, "percentile": gb_percentile},
        ]
        return {"type": "pitcher", "data": radar_data}

    bat_stats_df = get_league_stats('batting', current_year)
    player_bat_stats = bat_stats_df[bat_stats_df['IDfg'] == player_idfg] if not bat_stats_df.empty else pd.DataFrame()
    
    if not player_bat_stats.empty:
        stats = player_bat_stats.iloc[0]
        qualified_batters = bat_stats_df[bat_stats_df['PA'] >= 100]

        radar_data = [
            {"subject": "力量 SLG", "player_value": round(stats.get('SLG', 0), 3), "percentile": int(percentileofscore(qualified_batters['SLG'].dropna(), stats.get('SLG', 0)))},
            {"subject": "紀律 BB/K", "player_value": round(stats.get('BB/K', 0), 2), "percentile": int(percentileofscore(qualified_batters['BB/K'].dropna(), stats.get('BB/K', 0)))},
            {"subject": "技巧 AVG", "player_value": round(stats.get('AVG', 0), 3), "percentile": int(percentileofscore(qualified_batters['AVG'].dropna(), stats.get('AVG', 0)))},
            {"subject": "上壘 OBP", "player_value": round(stats.get('OBP', 0), 3), "percentile": int(percentileofscore(qualified_batters['OBP'].dropna(), stats.get('OBP', 0)))},
            {"subject": "速度 Spd", "player_value": round(stats.get('Spd', 0), 1), "percentile": int(percentileofscore(qualified_batters['Spd'].dropna(), stats.get('Spd', 0)))},
        ]
        return {"type": "batter", "data": radar_data}

    raise HTTPException(status_code=404, detail="在投打數據中都找不到該球員")

@app.get("/api/leaderboards")
async def get_leaderboards():
    today = datetime.now()
    data = pd.DataFrame()
    message = ""

    for i in range(1, 8):
        check_date = (today - timedelta(days=i)).strftime('%Y-%m-%d')
        print(f"正在嘗試獲取排行榜數據，日期: {check_date}")
        try:
            temp_data = statcast(start_dt=check_date, end_dt=check_date, verbose=0)
            if not temp_data.empty:
                data = pd.concat([data, temp_data])
        except Exception as e:
            print(f"獲取 {check_date} 數據時出錯: {e}")
            continue

    if data.empty:
        return {"message": "最近一週找不到任何比賽數據。"}
    
    start_date = (today - timedelta(days=7)).strftime('%Y-%m-%d')
    end_date = today.strftime('%Y-%m-%d')
    message = f"data period: {start_date} - {end_date}"
    results = {"message": message}
    
    async def process_leaderboard_item(df, column, player_id_col, format_str, is_int=False, ascending=False):
        if df.empty or column not in df.columns or player_id_col not in df.columns: return None
        df_copy = df.copy()
        df_copy[column] = pd.to_numeric(df_copy[column], errors='coerce')
        df_copy.dropna(subset=[column, player_id_col], inplace=True)
        if df_copy.empty: return None
        
        top_row = df_copy.sort_values(by=column, ascending=ascending).iloc[0]
        player_id = int(top_row[player_id_col])
        value = top_row[column]
        
        player_info = await get_player_info_by_id(player_id)
        
        return {
            "player_name": f"{player_info['name_first']} {player_info['name_last']}" if player_info else "Unknown",
            "value": format_str.format(value=int(value) if is_int else value),
            "image_url": player_info.get('image_url') if player_info else None
        }
        
    async def process_agg_leaderboard_item(df, group_by_col, agg_col, agg_func, format_str):
        if df.empty or group_by_col not in df.columns or agg_col not in df.columns: return None
        agg_data = df.groupby(group_by_col)[agg_col].agg(agg_func).reset_index()
        if agg_data.empty: return None
        top_row = agg_data.sort_values(by=agg_col, ascending=False).iloc[0]
        player_id = int(top_row[group_by_col])
        player_info = await get_player_info_by_id(player_id)
        return {
            "player_name": f"{player_info['name_first']} {player_info['name_last']}" if player_info else "Unknown",
            "value": format_str.format(value=top_row[agg_col]),
            "image_url": player_info.get('image_url') if player_info else None
        }

  # Pitcher Stats
    results["fastest_pitch"] = await process_leaderboard_item(data, 'release_speed', 'pitcher', "{value:.1f} mph")
    
    # 【BUG FIX & UPDATE】 Define strikeouts_df before using it and remove top_whiffer
    strikeouts_df = data[data['events'] == 'strikeout']
    results["most_strikeouts"] = await process_agg_leaderboard_item(strikeouts_df, 'pitcher', 'events', 'count', "{value} K's")

    # Batter Stats
    batted_balls = data.dropna(subset=['launch_speed', 'batter'])
    results["hardest_hit"] = await process_leaderboard_item(batted_balls, 'launch_speed', 'batter', "{value:.1f} mph")
    results["longest_homerun"] = await process_leaderboard_item(data[data['events'] == 'home_run'], 'hit_distance_sc', 'batter', "{value} ft", is_int=True)
    hits_df = data[data['events'].isin(['single', 'double', 'triple', 'home_run'])]
    results["most_hits"] = await process_agg_leaderboard_item(hits_df, 'batter', 'events', 'count', "{value} Hits")
    hr_df = data[data['events'] == 'home_run']
    results["most_homeruns"] = await process_agg_leaderboard_item(hr_df, 'batter', 'events', 'count', "{value} HR")

    return results

@app.get("/api/pitch-strategy")
async def get_pitch_strategy(pitcher_name: str, batter_name: str):
    pitcher_info = await get_player_info_by_name(pitcher_name)
    batter_info = await get_player_info_by_name(batter_name)
    if not pitcher_info or not batter_info:
        raise HTTPException(status_code=404, detail="無效的球員姓名")

    try:
        # 獲取打者的打擊慣用手 ('L' for Left, 'R' for Right)
        batter_stance = batter_info.get('bats')
        if not batter_stance or batter_stance not in ['L', 'R']:
             # 如果是兩打或是資訊不足，則分析投手對決所有打者的平均策略
            analysis_target = "所有打者"
            target_stance = None
        else:
            analysis_target = f"所有右打者" if batter_stance == 'R' else f"所有左打者"
            target_stance = batter_stance

        # 只獲取當前賽季的數據，讓策略分析更具時效性
        current_year = datetime.now().year
        data = statcast_pitcher(f'{current_year}-01-01', f'{current_year}-12-31', int(pitcher_info['key_mlbam']))

        if target_stance:
            strategy_data = data[data['stand'] == target_stance].copy()
        else:
            strategy_data = data.copy()

        if strategy_data.empty:
            return {"message": f"沒有足夠的數據來分析投手對 {analysis_target} 的策略"}

        # 1. 分析第一球 (搶好球數) 的策略
        first_pitch_df = strategy_data[strategy_data['pitch_number'] == 1]
        first_pitch_tendencies = {}
        if not first_pitch_df.empty:
            first_pitch_tendencies = (first_pitch_df['pitch_type'].value_counts(normalize=True) * 100).round(1).to_dict()

        # 2. 分析兩好球後 (決勝球) 的策略
        two_strikes_df = strategy_data[strategy_data['strikes'] == 2]
        two_strikes_tendencies = {}
        if not two_strikes_df.empty:
            two_strikes_tendencies = (two_strikes_df['pitch_type'].value_counts(normalize=True) * 100).round(1).to_dict()

        # 3. 分析造成三振的球路
        strikeout_pitches_df = strategy_data[strategy_data['events'] == 'strikeout']
        strikeout_pitch = {}
        if not strikeout_pitches_df.empty:
            strikeout_pitch = (strikeout_pitches_df['pitch_type'].value_counts(normalize=True) * 100).round(1).to_dict()


        return {
            "analysis_target": analysis_target, # 將分析對象傳給前端
            "first_pitch": first_pitch_tendencies,
            "two_strikes": two_strikes_tendencies,
            "strikeout_pitch": strikeout_pitch,
        }
    except Exception as e:
        print(f"分析投球策略時發生錯誤: {e}")
        raise HTTPException(status_code=500, detail="分析投球策略時發生錯誤")

@app.get("/api/player-info")
async def get_player_basic_info(name: str):
    player_info = await get_player_info_by_name(name)
    if not player_info:
        raise HTTPException(status_code=404, detail="Player not found")
    return {
        "name": player_info.get('name_first', '') + ' ' + player_info.get('name_last', ''),
        "image_url": player_info.get('image_url')
    }