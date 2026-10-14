import * as d3 from 'd3';

export const COLORS = {
    ink: '#17231d',
    paper: '#f7f6ef',
    grid: '#d8dbd1',
    muted: '#718078',
    acid: '#c9ff3d',
    blue: '#4d6bff',
    negative: '#e2543f',
    neutral: '#d7d8cf',
    positive: '#168a62'
};

export const anomalyColor = d3.scaleSequential()
    .domain([0, 1])
    .interpolator(d3.interpolateRgbBasis(['#d7f0e8', '#48b7aa', '#5965d8', '#d65382']));

export const sentimentColor = d3.scaleLinear()
    .domain([-1, 0, 1])
    .range([COLORS.negative, COLORS.neutral, COLORS.positive])
    .clamp(true);

export const cleanTopicName = (name) => String(name ?? '').replace(/[^a-zA-Z0-9-_]/g, '');

export const toggleTopic = (selectedTopics, topic) => {
    const exists = selectedTopics.some(item => item.name === topic.name);
    return exists
        ? selectedTopics.filter(item => item.name !== topic.name)
        : [...selectedTopics, topic];
};

export const topicTooltip = (topic, selected) => `
    <div class="tooltip-title">#${topic.name}</div>
    <div class="tooltip-grid">
        <span>Posts</span><strong>${topic.user_volume ?? topic.childrens?.length ?? '—'}</strong>
        <span>Anomaly</span><strong>${Number(topic.anamoly ?? 0).toFixed(2)}</strong>
        <span>Sentiment</span><strong>${Number(topic.sentiment ?? 0).toFixed(2)}</strong>
    </div>
    <div class="tooltip-action">${selected ? 'Click to remove from analysis' : 'Click to add to analysis'}</div>`;
