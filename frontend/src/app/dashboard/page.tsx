'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getChannelInfo, getChannelVideos } from '@/lib/api';
import VideoList from '@/components/dashboard/VideoList';
import StatsChart from '@/components/dashboard/StatsChart';
import TopVideos from '@/components/dashboard/TopVideos';
import UploadPatterns from '@/components/dashboard/UploadPatterns';
import EngagementAnalysis from '@/components/dashboard/EngagementAnalysis';
import GrowthMetrics from '@/components/dashboard/GrowthMetrics';
import ContentPerformance from '@/components/dashboard/ContentPerformance';
import TitleAnalysis from '@/components/dashboard/TitleAnalysis';
import CoreFansAnalysis from '@/components/dashboard/CoreFansAnalysis';

interface ChannelInfo {
  id: string;
  title: string;
  description: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  thumbnail: string;
  customUrl: string;
  publishedAt: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  duration: string;
  width?: number;
  height?: number;
}

function calculateRecentStats(videos: Video[]) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentVideos = videos.filter(video => 
    new Date(video.publishedAt) >= thirtyDaysAgo
  );

  if (recentVideos.length === 0) return { average: 0, median: 0 };

  const views = recentVideos.map(v => parseInt(v.viewCount));
  const average = views.reduce((a, b) => a + b, 0) / views.length;
  
  // 중앙값 계산
  const sorted = [...views].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];

  return { average, median };
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const channelId = searchParams.get('channelId');
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!channelId) return;
      
      try {
        setIsLoading(true);
        const [channelData, videosData] = await Promise.all([
          getChannelInfo(channelId),
          getChannelVideos(channelId)
        ]);
        
        setChannelInfo(channelData);
        setVideos(videosData);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [channelId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <div className="text-xl font-semibold">채널 데이터를 분석하고 있습니다</div>
            <div className="text-sm text-gray-500 text-center">
              채널의 모든 영상 정보를 가져오고 있습니다.<br />
              채널 크기에 따라 시간이 걸릴 수 있습니다.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <div className="text-red-500 text-center">
            <div className="text-xl font-semibold mb-2">오류가 발생했습니다</div>
            <div className="text-gray-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!channelInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <div className="text-xl text-center">채널 정보를 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 채널 기본 정보 */}
        {channelInfo && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={channelInfo.thumbnail}
                  alt={channelInfo.title}
                  className="w-24 h-24 rounded-full"
                />
                <div className="flex-grow">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{channelInfo.title}</h1>
                  <p className="text-gray-600">{channelInfo.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 통계 그리드 */}
        {channelInfo && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500 mb-1">구독자</h3>
              <p className="text-2xl font-bold text-gray-900">
                {parseInt(channelInfo.subscriberCount).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500 mb-1">조회수</h3>
              <p className="text-2xl font-bold text-gray-900">
                {parseInt(channelInfo.viewCount).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500 mb-1">영상 수</h3>
              <p className="text-2xl font-bold text-gray-900">
                {parseInt(channelInfo.videoCount).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500 mb-1">최근 30일 평균 조회수</h3>
              <p className="text-2xl font-bold text-gray-900">
                {calculateRecentStats(videos).average.toLocaleString(undefined, {maximumFractionDigits: 0})}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500 mb-1">최근 30일 조회수 중앙값</h3>
              <p className="text-2xl font-bold text-gray-900">
                {calculateRecentStats(videos).median.toLocaleString(undefined, {maximumFractionDigits: 0})}
              </p>
            </div>
          </div>
        )}
        
        {/* 메인 콘텐츠 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* 성장 지표 */}
          {videos.length > 0 && (
            <div className="mb-6">
              <GrowthMetrics videos={videos} />
            </div>
          )}

          {/* 첫 번째 행: 조회수 추이 + 참여율 분석 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {videos.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">조회수 추이</h2>
                  <StatsChart videos={videos.map(video => ({
                    date: video.publishedAt,
                    views: parseInt(video.viewCount),
                    title: video.title
                  }))} />
                </div>
              </div>
            )}
            {videos.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">참여율 분석</h2>
                  <EngagementAnalysis videos={videos} />
                </div>
              </div>
            )}
          </div>

          {/* 두 번째 행: 콘텐츠 성과 분석 + 제목 분석 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {videos.length > 0 && (
              <ContentPerformance videos={videos} />
            )}
            {videos.length > 0 && (
              <TitleAnalysis videos={videos} />
            )}
          </div>

          {/* 세 번째 행: 업로드 패턴 + 인기 동영상 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {videos.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">업로드 패턴</h2>
                  <UploadPatterns videos={videos} />
                </div>
              </div>
            )}
            {videos.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">인기 동영상 TOP 10</h2>
                  <TopVideos videos={videos} />
                </div>
              </div>
            )}
          </div>

          {/* 핵심 팬 분석 섹션 */}
          {channelInfo && (
            <div className="mb-6">
              <CoreFansAnalysis channelId={channelInfo.id} channelTitle={channelInfo.title} />
            </div>
          )}

          {/* 마지막 행: 전체 동영상 목록 */}
          {videos.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">전체 동영상</h2>
                <VideoList 
                  videos={videos} 
                  channelId={channelId || ''}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 