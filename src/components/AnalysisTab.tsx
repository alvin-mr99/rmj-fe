import { createSignal, For, Show } from 'solid-js';
import type { CableFeatureCollection, CableProperties } from '../types';
import type { Feature, LineString, Point } from 'geojson';

interface AnalysisTabProps {
    cableData: CableFeatureCollection;
    onClose: () => void;
    onFeatureSelect?: (feature: Feature<LineString | Point, CableProperties>, coordinates: [number, number]) => void;
}

export function AnalysisTab(props: AnalysisTabProps) {
    const [searchPoint, setSearchPoint] = createSignal('');
    const [searchLine, setSearchLine] = createSignal('');

    // Extract line features (routes)
    const getLineFeatures = () => {
        return props.cableData.features.filter(
            (f): f is Feature<LineString, CableProperties> => f.geometry.type === 'LineString'
        );
    };

    // Extract point features from line coordinates
    const getPointFeatures = () => {
        const points: Array<{
            id: string;
            coordinates: [number, number];
            routeId: string;
            routeName: string;
        }> = [];

        props.cableData.features.forEach(feature => {
            if (feature.geometry.type === 'LineString') {
                const coords = feature.geometry.coordinates as [number, number][];
                const routeName = feature.properties.name || feature.properties.id;
                coords.forEach((coord, index) => {
                    points.push({
                        id: `${routeName}-point-${index + 1}`,
                        coordinates: coord,
                        routeId: feature.properties.id,
                        routeName: routeName
                    });
                });
            }
        });

        return points;
    };

    // Filter functions
    const filteredLineFeatures = () => {
        const lines = getLineFeatures();
        const query = searchLine().toLowerCase();
        if (!query) return lines;

        return lines.filter(f =>
            (f.properties.name?.toLowerCase().includes(query)) ||
            (f.properties.id.toLowerCase().includes(query)) ||
            (f.properties.soilType.toLowerCase().includes(query))
        );
    };

    const filteredPointFeatures = () => {
        const points = getPointFeatures();
        const query = searchPoint().toLowerCase();
        if (!query) return points;

        return points.filter(p =>
            p.id.toLowerCase().includes(query) ||
            p.routeName.toLowerCase().includes(query) ||
            p.coordinates[0].toString().includes(query) ||
            p.coordinates[1].toString().includes(query)
        );
    };

    // Format coordinates
    const formatCoordinates = (coords: [number, number]): string => {
        return `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
    };

    // Format distance
    const formatDistance = (distance?: number): string => {
        if (!distance) return 'N/A';
        if (distance < 1000) {
            return `${distance.toFixed(2)} m`;
        }
        return `${(distance / 1000).toFixed(2)} km`;
    };

    // Get stats
    const getStats = () => {
        const lines = getLineFeatures();
        const points = getPointFeatures();

        return {
            totalLines: lines.length,
            totalPoints: points.length,
            filteredLines: filteredLineFeatures().length,
            filteredPoints: filteredPointFeatures().length
        };
    };

    const stats = getStats();

    const handleLineClick = (feature: Feature<LineString, CableProperties>) => {
        if (props.onFeatureSelect && feature.geometry.coordinates.length > 0) {
            const midIndex = Math.floor(feature.geometry.coordinates.length / 2);
            const coords = feature.geometry.coordinates[midIndex] as [number, number];
            props.onFeatureSelect(feature, coords);
        }
    };

    const handlePointClick = (point: { id: string; coordinates: [number, number]; routeId: string; routeName: string }) => {
        if (props.onFeatureSelect) {
            // Find the associated line feature
            const lineFeature = props.cableData.features.find(f => f.properties.id === point.routeId);
            if (lineFeature) {
                props.onFeatureSelect(lineFeature, point.coordinates);
            }
        }
    };

    return (
        <div
            class="absolute left-[304px] top-4 bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-[320px] h-[calc(100vh-32px)] flex flex-col z-[999]"
            style={{ "font-family": "'Poppins', sans-serif" }}
        >
            {/* Header */}
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div class="flex items-center gap-2">
                    <div class="text-[20px]">📈</div>
                    <div>
                        <h2 class="text-[16px] font-bold text-gray-800 m-0 tracking-[-0.5px]">Data Analysis</h2>
                        <p class="text-[11px] text-gray-500 m-0 mt-0.5">
                            {stats.totalLines} routes, {stats.totalPoints} points
                        </p>
                    </div>
                </div>
                <button
                    class="bg-gray-100 text-gray-600 w-8 h-8 rounded-[10px] cursor-pointer flex items-center justify-center text-[13px] transition-all duration-200 hover:bg-gray-200 border-none shadow-sm"
                    onClick={props.onClose}
                    title="Close analysis"
                >
                    ✕
                </button>
            </div>

            {/* Content */}
            <div class="flex-1 overflow-y-auto px-5 py-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

                {/* Point Features Section */}
                <div class="mb-4">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-[18px]">📍</span>
                        <h3 class="text-[15px] font-bold text-gray-800 m-0">Point Features</h3>
                        <span class="text-[12px] font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                            {stats.filteredPoints}
                        </span>
                    </div>

                    <div>
                        {/* Search Box */}
                        <div class="mb-2">
                                <div class="relative">
                                    <input
                                        type="text"
                                        value={searchPoint()}
                                        onInput={(e) => setSearchPoint(e.currentTarget.value)}
                                        placeholder="Search points by route name..."
                                        class="w-full px-3 py-2 pl-9 border border-gray-300 rounded-[10px] text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                </div>
                            </div>

                            {/* Points List */}
                            <div class="flex flex-col gap-2 max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                                <Show
                                    when={filteredPointFeatures().length > 0}
                                    fallback={
                                        <div class="text-center py-6 text-gray-400">
                                            <p class="text-[13px]">No points found</p>
                                        </div>
                                    }
                                >
                                    <For each={filteredPointFeatures()}>
                                        {(point) => (
                                            <button
                                                class="bg-gray-50 hover:bg-blue-50 rounded-[10px] p-2.5 transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-200 text-left w-full"
                                                onClick={() => handlePointClick(point)}
                                            >
                                                <div class="flex items-start justify-between gap-2">
                                                    <div class="flex-1 min-w-0">
                                                        <p class="text-[13px] font-semibold text-gray-800 m-0 truncate">
                                                            {point.id}
                                                        </p>
                                                        <p class="text-[11px] text-gray-600 m-0 mt-1 font-mono">
                                                            {formatCoordinates(point.coordinates)}
                                                        </p>
                                                    </div>
                                                    <span class="text-[18px] flex-shrink-0">📍</span>
                                                </div>
                                            </button>
                                        )}
                                    </For>
                                </Show>
                            </div>
                        </div>
                </div>

                {/* Line Features Section */}
                <div class="mb-4">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-[18px]">🛤️</span>
                        <h3 class="text-[15px] font-bold text-gray-800 m-0">Route Features</h3>
                        <span class="text-[12px] font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                            {stats.filteredLines}
                        </span>
                    </div>

                    <div class="mt-2">
                        {/* Search Box */}
                        <div class="mb-2">
                                <div class="relative">
                                    <input
                                        type="text"
                                        value={searchLine()}
                                        onInput={(e) => setSearchLine(e.currentTarget.value)}
                                        placeholder="Search routes by name or soil type..."
                                        class="w-full px-3 py-2 pl-9 border border-gray-300 rounded-[10px] text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                </div>
                            </div>

                            {/* Routes List */}
                            <div class="flex flex-col gap-2 max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                                <Show
                                    when={filteredLineFeatures().length > 0}
                                    fallback={
                                        <div class="text-center py-6 text-gray-400">
                                            <p class="text-[13px]">No routes found</p>
                                        </div>
                                    }
                                >
                                    <For each={filteredLineFeatures()}>
                                        {(feature) => {
                                            const coords = feature.geometry.coordinates as [number, number][];
                                            const props = feature.properties;

                                            return (
                                                <button
                                                    class="bg-gray-50 hover:bg-blue-50 rounded-[10px] p-2.5 transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-200 text-left w-full"
                                                    onClick={() => handleLineClick(feature)}
                                                >
                                                    <div class="flex items-start justify-between gap-2 mb-1.5">
                                                        <h4 class="text-[13px] font-bold text-gray-800 m-0 flex-1 truncate">
                                                            {props.name || props.id}
                                                        </h4>
                                                        <span class="text-[18px] flex-shrink-0">ℹ️</span>
                                                    </div>

                                                    <div class="grid grid-cols-2 gap-1.5 text-[11px]">
                                                        <div>
                                                            <span class="text-gray-500 font-semibold">Points:</span>
                                                            <span class="text-gray-800 ml-1">{coords.length}</span>
                                                        </div>
                                                        <div>
                                                            <span class="text-gray-500 font-semibold">Distance:</span>
                                                            <span class="text-gray-800 ml-1">{formatDistance(props.totalDistance)}</span>
                                                        </div>
                                                        <div>
                                                            <span class="text-gray-500 font-semibold">Soil Type:</span>
                                                            <span class="text-gray-800 ml-1">{props.soilType}</span>
                                                        </div>
                                                        <div>
                                                            <span class="text-gray-500 font-semibold">Depth:</span>
                                                            <span class="text-gray-800 ml-1">{props.depth.toFixed(2)} m</span>
                                                        </div>
                                                    </div>

                                                    <Show when={props.segments && props.segments.length > 0}>
                                                        <div class="mt-1.5 pt-1.5 border-t border-gray-200">
                                                            <span class="text-[11px] text-gray-500 font-semibold">
                                                                Segments: {props.segments!.length}
                                                            </span>
                                                        </div>
                                                    </Show>
                                                </button>
                                            );
                                        }}
                                    </For>
                                </Show>
                            </div>
                        </div>
                </div>

            </div>

            {/* Summary Footer */}
            <div class="px-5 py-3 border-t border-gray-100 bg-gray-50">
                <div class="grid grid-cols-2 gap-2.5">
                    <div class="bg-white rounded-[10px] p-2.5 text-center">
                        <p class="text-[18px] font-bold text-blue-600 m-0">{stats.totalLines}</p>
                        <p class="text-[11px] text-gray-600 m-0 mt-0.5">Total Routes</p>
                    </div>
                    <div class="bg-white rounded-[10px] p-2.5 text-center">
                        <p class="text-[18px] font-bold text-green-600 m-0">{stats.totalPoints}</p>
                        <p class="text-[11px] text-gray-600 m-0 mt-0.5">Total Points</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
