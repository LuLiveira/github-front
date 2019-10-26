import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Lottie from 'react-lottie';
import api from '../../services/api';

import image from '../../assets/rocket.json';

import {
  Loading,
  Owner,
  IssueList,
  NextButton,
  PreviousButton,
  Actions,
  FilterButton,
  Filter,
} from './style';
import Container from '../../components/Container/index';

// import { Container } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    pages: 1,
    filter: [
      { state: 'all', label: 'Todos' },
      { state: 'open', label: 'Abertos' },
      { state: 'closed', label: 'Fechados' },
    ],
    selectFilter: '',
  };

  async componentDidMount() {
    const { match } = this.props;
    const { pages } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'all',
          per_page: 5,
          page: pages,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  // Salvar os dados no localStorage
  async componentDidUpdate(_, prevState) {
    const { pages, selectFilter } = this.state;
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    if (prevState.pages !== pages || prevState.selectFilter !== selectFilter) {
      const response = await api.get(`/repos/${repoName}/issues`, {
        params: {
          state: selectFilter,
          per_page: 5,
          page: pages,
        },
      });

      this.setState({
        issues: response.data,
      });
    }
  }

  render() {
    const { repository, issues, loading, pages, filter } = this.state;

    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: image,
      renderSettings: {
        preserveAspectRatio: 'xMidYMid slice',
      },
    };

    if (loading) {
      return (
        <Loading>
          <Lottie
            options={defaultOptions}
            height={400}
            width={400}
            isStopped={false}
            isPaused={false}
          />
        </Loading>
      );
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <Filter>
          {filter.map(states => (
            <FilterButton
              onClick={() => this.setState({ selectFilter: states.state })}
            >
              {' '}
              {states.label}{' '}
            </FilterButton>
          ))}
        </Filter>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Actions>
          <PreviousButton
            page={pages === 1}
            onClick={() =>
              this.setState({
                pages: pages > 1 ? pages - 1 : pages,
              })
            }
          >
            {' '}
            Anterior{' '}
          </PreviousButton>
          <NextButton onClick={() => this.setState({ pages: pages + 1 })}>
            {' '}
            Próximo{' '}
          </NextButton>
        </Actions>
      </Container>
    );
  }
}
